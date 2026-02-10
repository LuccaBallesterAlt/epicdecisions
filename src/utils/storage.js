import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const STORAGE_KEY = '@epic_decision_roletas_v2';
const GROUPS_STORAGE_KEY = '@epic_decision_groups_v1';

// Migração automática: tenta carregar versões antigas também
const tryLegacyKeys = async () => {
  const legacyKeys = ['@epic_decision_roletas', '@roletas', '@roleta_storage'];
  for (const key of legacyKeys) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Migra para a nova chave
          await AsyncStorage.setItem(STORAGE_KEY, raw);
          await AsyncStorage.removeItem(key);
          return parsed;
        }
      }
    } catch (e) {
      // Ignora erros em chaves antigas
    }
  }
  return null;
};

export const loadRoletas = async () => {
  try {
    // Tenta carregar da chave atual
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    // Tenta migrar de chaves antigas
    const legacy = await tryLegacyKeys();
    if (legacy) {
      return legacy;
    }
    return [];
  } catch (error) {
    console.warn('Failed to load roletas', error);
    return [];
  }
};

export const persistRoletas = async (roletas) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(roletas));
  } catch (error) {
    console.warn('Failed to persist roletas', error);
  }
};

export const exportRoletas = async (roletas) => {
  try {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      roletas,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `roletas_backup_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Salvar backup das roletas',
      });
    } else {
      console.warn('Sharing não está disponível');
    }
    return true;
  } catch (error) {
    console.warn('Failed to export roletas', error);
    throw error;
  }
};

export const importRoletas = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled) {
      return null;
    }
    const fileUri = result.assets[0].uri;
    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const parsed = JSON.parse(jsonString);
    if (parsed.roletas && Array.isArray(parsed.roletas)) {
      return parsed.roletas;
    }
    // Fallback: tenta usar o objeto diretamente se for array
    if (Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error('Formato de arquivo inválido');
  } catch (error) {
    console.warn('Failed to import roletas', error);
    throw error;
  }
};

export const loadGroups = async () => {
  try {
    const raw = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    console.warn('Failed to load groups', error);
    return [];
  }
};

export const persistGroups = async (groups) => {
  try {
    await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.warn('Failed to persist groups', error);
  }
};

