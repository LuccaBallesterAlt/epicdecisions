import { useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRoletas } from '../context/RoletaContext';

export const ResultScreen = ({ route, navigation }) => {
  const { roletaId, option } = route.params ?? {};
  const { getRoletaById } = useRoletas();
  const roleta = getRoletaById(roletaId);
  const confettiRef = useRef(null);

  useEffect(() => {
    confettiRef.current?.start?.();
  }, []);

  if (!option) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Nenhum resultado disponível.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonOutline}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#10022B', '#320047', '#050512']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ConfettiCannon
          ref={confettiRef}
          count={180}
          origin={{ x: 0, y: 0 }}
          fadeOut
          autoStart={false}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Text style={styles.subtitle}>Resultado de {roleta?.name ?? 'roleta'}</Text>
          <Text style={styles.title}>Decisão Épica!</Text>
          <View style={styles.card}>
            {option.imageUri ? (
              <Image source={{ uri: option.imageUri }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.imagePlaceholderText}>Sem imagem</Text>
              </View>
            )}
            <Text style={styles.optionText}>{option.text || 'Sem título'}</Text>
            {option.description ? (
              <Text style={styles.descriptionText}>{option.description}</Text>
            ) : null}
          </View>
          <Text style={styles.weightText}>Peso configurado: {option.weight}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryText}>Girar novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('RoletaDetail', { roletaId })}
            >
              <Text style={styles.secondaryText}>Editar roleta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050512',
  },
  fallbackText: {
    color: '#fff',
    marginBottom: 16,
  },
  backButtonOutline: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 999,
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
    color: '#F9C74F',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#1A0F2E',
    borderWidth: 1,
    borderColor: '#F3722C',
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#24123C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#bbb',
  },
  optionText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  descriptionText: {
    color: '#ddd',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    width: '100%',
  },
  weightText: {
    color: '#bbb',
    marginTop: 12,
  },
  actions: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#F94144',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

