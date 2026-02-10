import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';

export const useImagePicker = () => {
  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para continuar.');
        return null;
      }
      const mediaTypesConfig = ImagePicker.MediaType
        ? { mediaTypes: [ImagePicker.MediaType.IMAGE] }
        : { mediaTypes: ImagePicker.MediaTypeOptions.Images };
      const result = await ImagePicker.launchImageLibraryAsync({
        ...mediaTypesConfig,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets?.[0]?.uri ?? null;
    } catch (error) {
      console.warn('Erro ao selecionar imagem', error);
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
      return null;
    }
  }, []);

  return { pickImage };
};
