import { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const RoletaCard = memo(({ name, coverImage, onPress, onDelete }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={styles.cover}
          cache="force-cache"
          progressiveRenderingEnabled
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.placeholderText}>Imagem</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton} activeOpacity={0.7}>
            <Text style={styles.deleteText}>Excluir</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders
  return (
    prevProps.name === nextProps.name &&
    prevProps.coverImage === nextProps.coverImage &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onDelete === nextProps.onDelete
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12122B',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F3D',
  },
  cover: {
    width: '100%',
    height: 160,
  },
  coverPlaceholder: {
    backgroundColor: '#202045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  body: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F94144',
    borderRadius: 999,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

