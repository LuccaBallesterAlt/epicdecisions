import { memo, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WeightInput } from './WeightInput';

export const OptionItem = memo(({
  option,
  onChangeText,
  onChangeWeight,
  onPickImage,
  onRemove,
  onLongPress,
  isDragging,
  onChangeDescription,
}) => {
  const [showDescription, setShowDescription] = useState(Boolean(option.description));

  useEffect(() => {
    if (option.description) {
      setShowDescription(true);
    }
  }, [option.description]);

  return (
    <TouchableOpacity
      style={[styles.container, isDragging && styles.dragging]}
      activeOpacity={0.9}
      onLongPress={onLongPress}
      delayLongPress={150}
    >
      <TouchableOpacity style={styles.imageButton} onPress={onPickImage} activeOpacity={0.7}>
        {option.imageUri ? (
          <Image
            source={{ uri: option.imageUri }}
            style={styles.image}
            cache="force-cache"
          />
        ) : (
          <Text style={styles.imagePlaceholder}>Imagem</Text>
        )}
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.label}>Opção</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite uma descrição"
          placeholderTextColor="#777"
          value={option.text}
          onChangeText={onChangeText}
          maxLength={100}
        />
        <WeightInput value={option.weight} onChange={onChangeWeight} />
        {showDescription ? (
          <View style={styles.descriptionBlock}>
            <Text style={[styles.label, { marginTop: 12 }]}>Descrição opcional</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Conte mais detalhes para exibir no resultado"
              placeholderTextColor="#777"
              value={option.description}
              onChangeText={onChangeDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.descriptionButton}
            onPress={() => setShowDescription(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.descriptionButtonText}>Adicionar descrição</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove} activeOpacity={0.7}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.option.id === nextProps.option.id &&
    prevProps.option.text === nextProps.option.text &&
    prevProps.option.imageUri === nextProps.option.imageUri &&
    prevProps.option.weight === nextProps.option.weight &&
    prevProps.option.description === nextProps.option.description &&
    prevProps.isDragging === nextProps.isDragging
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#15152B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#25254A',
  },
  dragging: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  imageButton: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#202040',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  label: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1C1C35',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  multiline: {
    height: 84,
    textAlignVertical: 'top',
  },
  descriptionBlock: {
    marginBottom: 4,
  },
  descriptionButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2B2B55',
    alignItems: 'center',
  },
  descriptionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2B2B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#F94144',
    fontSize: 20,
    lineHeight: 20,
  },
});

