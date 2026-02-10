import { useCallback, useLayoutEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import { StackActions, useFocusEffect } from '@react-navigation/native';
import { useRoletas } from '../context/RoletaContext';
import { useImagePicker } from '../hooks/useImagePicker';
import { OptionItem } from '../components/OptionItem';

export const RoletaDetailScreen = ({ route, navigation }) => {
  const { roletaId } = route.params ?? {};
  const { getRoletaById, updateRoleta, addOption, updateOption, removeOption, reorderOptions } =
    useRoletas();
  const roleta = getRoletaById(roletaId);
  const { pickImage } = useImagePicker();

  useLayoutEffect(() => {
    navigation.setOptions({ title: roleta?.name ?? 'Detalhes da Roleta' });
  }, [navigation, roleta?.name]);

  useFocusEffect(
    useCallback(() => {
      const state = navigation.getState();
      const routes = state?.routes ?? [];
      const previousRouteName = routes[state.index - 1]?.name;
      const shouldPopToHome = previousRouteName && previousRouteName !== 'Home';

      navigation.setOptions({
        headerLeft: shouldPopToHome
          ? (props) => (
              <HeaderBackButton
                {...props}
                tintColor="#fff"
                onPress={() => navigation.dispatch(StackActions.popToTop())}
              />
            )
          : undefined,
      });
    }, [navigation])
  );

  if (!roleta) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Roleta não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const handleSelectCover = async () => {
    const uri = await pickImage();
    if (uri) {
      updateRoleta(roleta.id, { coverImage: uri });
    }
  };

  const handleAddOption = () => {
    addOption(roleta.id);
  };

  const handleRemoveOption = (optionId, optionText) => {
    if (roleta.options.length === 1) {
      Alert.alert('Ops!', 'Você precisa de pelo menos uma opção para girar.');
      return;
    }
    const optionName = optionText || 'esta opção';
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${optionName}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removeOption(roleta.id, optionId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>Nome da roleta</Text>
          <TextInput
            style={styles.input}
            value={roleta.name}
            onChangeText={(text) => updateRoleta(roleta.id, { name: text })}
            placeholder="Ex: Poderes"
            placeholderTextColor="#777"
          />

          <Text style={[styles.label, styles.spacing]}>Imagem de capa</Text>
          <TouchableOpacity style={styles.coverPicker} onPress={handleSelectCover}>
            {roleta.coverImage ? (
              <Image source={{ uri: roleta.coverImage }} style={styles.coverImage} />
            ) : (
              <Text style={styles.coverText}>Selecionar da galeria</Text>
            )}
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Opções ({roleta.options.length})</Text>
            <TouchableOpacity style={styles.sectionButton} onPress={handleAddOption}>
              <Text style={styles.sectionButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {roleta.options.map((option, index) => (
          <View key={option.id} style={styles.optionRow}>
            <OptionItem
              option={option}
              onChangeText={(text) => updateOption(roleta.id, option.id, { text })}
              onChangeWeight={(weight) =>
                updateOption(roleta.id, option.id, { weight: weight.replace(',', '.') })
              }
              onChangeDescription={(description) => updateOption(roleta.id, option.id, { description })}
              onPickImage={async () => {
                const uri = await pickImage();
                if (uri) {
                  updateOption(roleta.id, option.id, { imageUri: uri });
                }
              }}
              onRemove={() => handleRemoveOption(option.id, option.text)}
            />

            <View style={styles.reorderButtons}>
              <TouchableOpacity
                style={[styles.reorderButton, index === 0 && styles.reorderDisabled]}
                disabled={index === 0}
                onPress={() => {
                  if (index === 0) return;
                  const newOptions = [...roleta.options];
                  const tmp = newOptions[index - 1];
                  newOptions[index - 1] = newOptions[index];
                  newOptions[index] = tmp;
                  reorderOptions(roleta.id, newOptions);
                }}
              >
                <Text style={styles.reorderText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reorderButton,
                  index === roleta.options.length - 1 && styles.reorderDisabled,
                ]}
                disabled={index === roleta.options.length - 1}
                onPress={() => {
                  if (index === roleta.options.length - 1) return;
                  const newOptions = [...roleta.options];
                  const tmp = newOptions[index + 1];
                  newOptions[index + 1] = newOptions[index];
                  newOptions[index] = tmp;
                  reorderOptions(roleta.id, newOptions);
                }}
              >
                <Text style={styles.reorderText}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.primaryButton, { opacity: roleta.options.length ? 1 : 0.6 }]}
        onPress={() => navigation.navigate('Wheel', { roletaId: roleta.id })}
        disabled={!roleta.options.length}
      >
        <Text style={styles.primaryButtonText}>Ir para a roleta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050512',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050512',
  },
  fallbackText: {
    color: '#fff',
  },
  scroll: {
    padding: 16,
    paddingBottom: 120,
  },
  headerBlock: {
    marginBottom: 12,
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
  },
  spacing: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#15152B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#22224A',
  },
  coverPicker: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B2B55',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11112A',
    overflow: 'hidden',
    height: 160,
  },
  coverText: {
    color: '#fff',
    fontWeight: '600',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2B2B55',
  },
  sectionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#F3722C',
    borderRadius: 999,
    margin: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  optionRow: {
    marginBottom: 12,
  },
  reorderButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  reorderButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2B2B55',
  },
  reorderDisabled: {
    opacity: 0.4,
  },
  reorderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

