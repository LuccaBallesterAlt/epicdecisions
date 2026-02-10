import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import uuid from 'react-native-uuid';
import {
  loadRoletas,
  persistRoletas,
  exportRoletas as exportStorage,
  importRoletas as importStorage,
  loadGroups,
  persistGroups,
} from '../utils/storage';

const RoletaContext = createContext(null);

const createEmptyOption = () => ({
  id: uuid.v4(),
  text: '',
  imageUri: null,
  weight: 1,
  description: '',
});

const createEmptyRoleta = () => ({
  id: uuid.v4(),
  name: 'Nova Roleta',
  coverImage: null,
  options: [createEmptyOption()],
});

const createEmptyGroup = () => ({
  id: uuid.v4(),
  name: 'Novo Grupo',
  roletaIds: [],
});

export const RoletaProvider = ({ children }) => {
  const [roletas, setRoletas] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeRoleta = useCallback((roleta) => {
    if (!roleta) return roleta;
    return {
      ...roleta,
      options: (roleta.options ?? []).map((option) => ({
        ...option,
        description: option?.description ?? '',
      })),
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = await loadRoletas();
      const normalized = stored.length ? stored.map(normalizeRoleta) : [];
      setRoletas(normalized);

      let storedGroups = await loadGroups();
      // Migração: se não houver grupos mas houver roletas, cria grupo padrão
      if (storedGroups.length === 0 && normalized.length > 0) {
        const defaultGroup = {
          id: uuid.v4(),
          name: 'Geral',
          roletaIds: normalized.map((r) => r.id),
        };
        storedGroups = [defaultGroup];
        await persistGroups(storedGroups);
      }
      setGroups(storedGroups);
      setIsLoading(false);
    };
    bootstrap();
  }, [normalizeRoleta]);

  const updateState = useCallback((updater) => {
    setRoletas((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      persistRoletas(nextState);
      return nextState;
    });
  }, []);

  const updateGroupsState = useCallback((updater) => {
    setGroups((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      persistGroups(nextState);
      return nextState;
    });
  }, []);

  const createRoleta = useCallback(
    (groupId = null) => {
      const newRoleta = createEmptyRoleta();
      updateState((prev) => [newRoleta, ...prev]);

      // Adiciona ao grupo especificado ou ao primeiro grupo disponível
      updateGroupsState((prev) => {
        if (prev.length === 0) {
          // Se não houver grupos, cria um grupo padrão
          const defaultGroup = createEmptyGroup();
          defaultGroup.name = 'Geral';
          defaultGroup.roletaIds = [newRoleta.id];
          return [defaultGroup];
        }
        const targetGroupId = groupId || prev[0].id;
        return prev.map((group) =>
          group.id === targetGroupId ? { ...group, roletaIds: [...group.roletaIds, newRoleta.id] } : group
        );
      });

      return newRoleta;
    },
    [updateState, updateGroupsState]
  );

  const deleteRoleta = useCallback(
    (roletaId) => {
      updateState((prev) => prev.filter((roleta) => roleta.id !== roletaId));
      // Remove de todos os grupos
      updateGroupsState((prev) =>
        prev.map((group) => ({
          ...group,
          roletaIds: group.roletaIds.filter((id) => id !== roletaId),
        }))
      );
    },
    [updateState, updateGroupsState]
  );

  const updateRoleta = useCallback(
    (roletaId, data) => {
      updateState((prev) =>
        prev.map((roleta) =>
          roleta.id === roletaId ? normalizeRoleta({ ...roleta, ...data }) : roleta
        )
      );
    },
    [updateState, normalizeRoleta]
  );

  const addOption = useCallback(
    (roletaId) => {
      const newOption = createEmptyOption();
      updateState((prev) =>
        prev.map((roleta) =>
          roleta.id === roletaId
            ? { ...roleta, options: [...roleta.options, newOption] }
            : roleta
        )
      );
      return newOption;
    },
    [updateState]
  );

  const updateOption = useCallback(
    (roletaId, optionId, data) => {
      updateState((prev) =>
        prev.map((roleta) =>
          roleta.id === roletaId
            ? {
                ...roleta,
                options: roleta.options.map((option) =>
                  option.id === optionId ? { ...option, ...data } : option
                ),
              }
            : roleta
        )
      );
    },
    [updateState]
  );

  const removeOption = useCallback(
    (roletaId, optionId) => {
      updateState((prev) =>
        prev.map((roleta) =>
          roleta.id === roletaId
            ? {
                ...roleta,
                options: roleta.options.filter((option) => option.id !== optionId),
              }
            : roleta
        )
      );
    },
    [updateState]
  );

  const reorderOptions = useCallback(
    (roletaId, orderedOptions) => {
      updateState((prev) =>
        prev.map((roleta) =>
          roleta.id === roletaId ? { ...roleta, options: orderedOptions } : roleta
        )
      );
    },
    [updateState]
  );

  const createGroup = useCallback(() => {
    const newGroup = createEmptyGroup();
    updateGroupsState((prev) => [newGroup, ...prev]);
    return newGroup;
  }, [updateGroupsState]);

  const updateGroup = useCallback(
    (groupId, data) => {
      updateGroupsState((prev) =>
        prev.map((group) => (group.id === groupId ? { ...group, ...data } : group))
      );
    },
    [updateGroupsState]
  );

  const deleteGroup = useCallback(
    (groupId) => {
      updateGroupsState((prev) => prev.filter((group) => group.id !== groupId));
    },
    [updateGroupsState]
  );

  const moveRoletaToGroup = useCallback(
    (roletaId, targetGroupId) => {
      updateGroupsState((prev) => {
        // Remove de todos os grupos
        const withoutRoleta = prev.map((group) => ({
          ...group,
          roletaIds: group.roletaIds.filter((id) => id !== roletaId),
        }));
        // Adiciona ao grupo alvo
        return withoutRoleta.map((group) =>
          group.id === targetGroupId ? { ...group, roletaIds: [...group.roletaIds, roletaId] } : group
        );
      });
    },
    [updateGroupsState]
  );

  const exportRoletas = useCallback(async () => {
    try {
      await exportStorage(roletas);
      return true;
    } catch (error) {
      console.warn('Failed to export', error);
      throw error;
    }
  }, [roletas]);

  const importRoletas = useCallback(async () => {
    try {
      const imported = await importStorage();
      if (imported) {
        const normalized = imported.map(normalizeRoleta);
        updateState(normalized);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to import', error);
      throw error;
    }
  }, [updateState, normalizeRoleta]);

  const value = useMemo(
    () => ({
      roletas,
      groups,
      isLoading,
      createRoleta,
      deleteRoleta,
      updateRoleta,
      addOption,
      updateOption,
      removeOption,
      reorderOptions,
      createGroup,
      updateGroup,
      deleteGroup,
      moveRoletaToGroup,
      exportRoletas,
      importRoletas,
      getRoletaById: (id) => roletas.find((roleta) => roleta.id === id),
      getGroupById: (id) => groups.find((group) => group.id === id),
      getRoletasByGroupId: (groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (!group) return [];
        return roletas.filter((roleta) => group.roletaIds.includes(roleta.id));
      },
    }),
    [
      roletas,
      groups,
      isLoading,
      createRoleta,
      deleteRoleta,
      updateRoleta,
      addOption,
      updateOption,
      removeOption,
      reorderOptions,
      createGroup,
      updateGroup,
      deleteGroup,
      moveRoletaToGroup,
      exportRoletas,
      importRoletas,
    ]
  );

  return <RoletaContext.Provider value={value}>{children}</RoletaContext.Provider>;
};

export const useRoletas = () => {
  const context = useContext(RoletaContext);
  if (!context) {
    throw new Error('useRoletas deve ser usado dentro de RoletaProvider');
  }
  return context;
};

