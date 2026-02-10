import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRoletas } from '../context/RoletaContext';
import { RoletaCard } from '../components/RoletaCard';

const GroupSection = ({
  group,
  roletas,
  searchQuery,
  onDeleteRoleta,
  onEditGroup,
  onDeleteGroup,
  onCreateRoleta,
  navigation,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const groupRoletas = useMemo(() => {
    return roletas.filter((roleta) => group.roletaIds.includes(roleta.id));
  }, [roletas, group.roletaIds]);

  const filteredRoletas = useMemo(() => {
    const query = (groupSearchQuery || searchQuery || '').toLowerCase().trim();
    if (!query) {
      return groupRoletas;
    }
    return groupRoletas.filter((roleta) => roleta.name.toLowerCase().includes(query));
  }, [groupRoletas, groupSearchQuery, searchQuery]);

  const handleDeleteGroup = useCallback(() => {
    if (groupRoletas.length > 0) {
      Alert.alert(
        'Confirmar exclusão',
        `O grupo "${group.name}" contém ${groupRoletas.length} roleta(s). Todas serão removidas do grupo. Deseja continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => onDeleteGroup(group.id),
          },
        ]
      );
    } else {
      Alert.alert(
        'Confirmar exclusão',
        `Tem certeza que deseja excluir o grupo "${group.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => onDeleteGroup(group.id),
          },
        ]
      );
    }
  }, [group.name, group.id, groupRoletas.length, onDeleteGroup]);

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeaderLeft}>
          <Text style={styles.groupHeaderIcon}>{isExpanded ? '▼' : '▶'}</Text>
          <Text style={styles.groupTitle}>{group.name}</Text>
          <Text style={styles.groupCount}>({groupRoletas.length})</Text>
        </View>
        <View style={styles.groupHeaderRight}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEditGroup(group);
            }}
            style={styles.groupActionButton}
          >
            <Text style={styles.groupActionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteGroup();
            }}
            style={styles.groupActionButton}
          >
            <Text style={styles.groupActionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.groupContent}>
          {groupRoletas.length > 0 && (
            <View style={styles.groupSearchContainer}>
              <TextInput
                style={styles.groupSearchInput}
                placeholder={`Pesquisar em ${group.name}...`}
                placeholderTextColor="#777"
                value={groupSearchQuery}
                onChangeText={setGroupSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {filteredRoletas.length === 0 ? (
            <View style={styles.groupEmptyState}>
              <Text style={styles.groupEmptyText}>
                {groupRoletas.length === 0
                  ? 'Nenhuma roleta neste grupo'
                  : 'Nenhuma roleta encontrada'}
              </Text>
            </View>
          ) : (
            <View style={styles.groupRoletasList}>
              {filteredRoletas.map((roleta) => (
                <RoletaCard
                  key={roleta.id}
                  name={roleta.name}
                  coverImage={roleta.coverImage}
                  onPress={() => navigation.navigate('Wheel', { roletaId: roleta.id })}
                  onDelete={() => onDeleteRoleta(roleta.id, roleta.name)}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.createRoletaButton}
            onPress={() => onCreateRoleta(group.id)}
          >
            <Text style={styles.createRoletaButtonText}>+ Adicionar roleta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const HomeScreen = ({ navigation }) => {
  const {
    groups,
    roletas,
    createRoleta,
    deleteRoleta,
    isLoading,
    exportRoletas,
    importRoletas,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useRoletas();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const handleExport = useCallback(async () => {
    const allRoletas = groups.flatMap((g) => g.roletaIds).length;
    if (allRoletas === 0) {
      Alert.alert('Ops!', 'Não há roletas para exportar.');
      return;
    }
    try {
      setExporting(true);
      await exportRoletas();
      Alert.alert('Sucesso!', 'Backup das roletas exportado com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar as roletas.');
    } finally {
      setExporting(false);
    }
  }, [groups, exportRoletas]);

  const handleImport = useCallback(async () => {
    try {
      setImporting(true);
      const success = await importRoletas();
      if (success) {
        Alert.alert('Sucesso!', 'Roletas importadas com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível importar as roletas. Verifique se o arquivo está no formato correto.');
    } finally {
      setImporting(false);
    }
  }, [importRoletas]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting || groups.flatMap((g) => g.roletaIds).length === 0}
            style={styles.headerButton}
          >
            <Text
              style={[
                styles.headerButtonText,
                (exporting || groups.flatMap((g) => g.roletaIds).length === 0) && styles.headerButtonDisabled,
              ]}
            >
              {exporting ? '...' : '📤'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImport} disabled={importing} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, importing && styles.headerButtonDisabled]}>
              {importing ? '...' : '📥'}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, groups, exporting, importing, handleExport, handleImport]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: 'Decisão Épica' });
    }, [navigation])
  );

  const handleCreateGroup = () => {
    const newGroup = createGroup();
    setEditingGroup(newGroup);
    setEditingGroupName(newGroup.name);
  };

  const handleSaveGroupName = () => {
    if (editingGroup) {
      if (editingGroupName.trim()) {
        updateGroup(editingGroup.id, { name: editingGroupName.trim() });
      }
      setEditingGroup(null);
      setEditingGroupName('');
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setEditingGroupName(group.name);
  };

  const handleCreateRoleta = useCallback(
    (groupId) => {
      const newRoleta = createRoleta(groupId);
      navigation.navigate('RoletaDetail', { roletaId: newRoleta.id });
    },
    [createRoleta, navigation]
  );

  const handleDeleteRoleta = useCallback((roletaId, roletaName) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a roleta "${roletaName}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteRoleta(roletaId),
        },
      ]
    );
  }, [deleteRoleta]);

  const allRoletas = useMemo(() => {
    return groups.flatMap((g) => g.roletaIds);
  }, [groups]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#F9C74F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {groups.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar em todos os grupos..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {editingGroup && (
        <View style={styles.editGroupContainer}>
          <TextInput
            style={styles.editGroupInput}
            value={editingGroupName}
            onChangeText={setEditingGroupName}
            placeholder="Nome do grupo"
            placeholderTextColor="#777"
            autoFocus
          />
          <TouchableOpacity onPress={handleSaveGroupName} style={styles.saveGroupButton}>
            <Text style={styles.saveGroupText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setEditingGroup(null);
              setEditingGroupName('');
            }}
            style={styles.cancelGroupButton}
          >
            <Text style={styles.cancelGroupText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum grupo ainda</Text>
          <Text style={styles.emptySubtitle}>
            Crie um grupo para organizar suas roletas.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {groups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              roletas={roletas}
              searchQuery={searchQuery}
              onDeleteRoleta={handleDeleteRoleta}
              onEditGroup={handleEditGroup}
              onDeleteGroup={deleteGroup}
              onCreateRoleta={handleCreateRoleta}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fabGroup} onPress={handleCreateGroup}>
        <Text style={styles.fabText}>📁</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050512',
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#15152B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#22224A',
  },
  editGroupContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editGroupInput: {
    flex: 1,
    backgroundColor: '#15152B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#22224A',
  },
  saveGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#43AA8B',
    borderRadius: 8,
  },
  saveGroupText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2B2B55',
    borderRadius: 8,
  },
  cancelGroupText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050512',
  },
  emptyState: {
    marginTop: 120,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#12122B',
    borderWidth: 1,
    borderColor: '#1F1F3D',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#bbb',
    lineHeight: 20,
  },
  groupContainer: {
    marginBottom: 16,
    backgroundColor: '#12122B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F3D',
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupHeaderIcon: {
    color: '#F9C74F',
    fontSize: 12,
    marginRight: 8,
  },
  groupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  groupCount: {
    color: '#888',
    fontSize: 14,
  },
  groupHeaderRight: {
    flexDirection: 'row',
    gap: 8,
  },
  groupActionButton: {
    padding: 4,
  },
  groupActionText: {
    fontSize: 16,
  },
  groupContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupSearchContainer: {
    marginBottom: 12,
  },
  groupSearchInput: {
    backgroundColor: '#0A0A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  groupEmptyState: {
    padding: 16,
    alignItems: 'center',
  },
  groupEmptyText: {
    color: '#888',
    fontSize: 14,
  },
  groupRoletasList: {
    gap: 12,
  },
  createRoletaButton: {
    marginTop: 12,
    backgroundColor: '#2B2B55',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B3B6B',
    borderStyle: 'dashed',
  },
  createRoletaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fabGroup: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#43AA8B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43AA8B',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    fontSize: 20,
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
});
