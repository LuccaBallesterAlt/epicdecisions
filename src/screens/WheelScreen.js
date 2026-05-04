import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoletas } from '../context/RoletaContext';
import { WheelCanvas } from '../components/WheelCanvas';
import { buildSegments, chooseWeightedSegment } from '../utils/wheel';

const formatWeight = (weight) => {
  const numeric = Number(weight);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  if (numeric >= 1) {
    return numeric.toFixed(2).replace(/\.00$/, '');
  }
  return numeric.toPrecision(2);
};

const OptionRow = ({ option, percentage }) => (
  <View style={styles.optionRow}>
    <View style={[styles.colorDot, { backgroundColor: option.color }]} />
    <View style={{ flex: 1 }}>
      <Text style={styles.optionText}>{option.text || 'Sem título'}</Text>
      <View style={styles.weightRow}>
        <Text style={styles.optionWeight}>Peso: {formatWeight(option.weight)}</Text>
        <Text style={styles.optionPercentage}>{percentage}%</Text>
      </View>
    </View>
  </View>
);

export const WheelScreen = ({ route, navigation }) => {
  const { roletaId } = route.params ?? {};
  const { getRoletaById } = useRoletas();
  const roleta = getRoletaById(roletaId);
  
  const [spinning, setSpinning] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const spinValue = useRef(new Animated.Value(0)).current;
  const rotationSeed = useRef(0);

  const handleHeaderUpdate = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => setAnimationEnabled(!animationEnabled)}
            style={[styles.headerAnimationButton, animationEnabled && styles.headerAnimationButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerAnimationText, animationEnabled && styles.headerAnimationTextActive]}>
              {animationEnabled ? '🎬' : '⚡'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('RoletaDetail', { roletaId })}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Text style={styles.headerButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, roletaId, animationEnabled]);

  useLayoutEffect(() => {
    handleHeaderUpdate();
  }, [handleHeaderUpdate]);

  const segments = useMemo(() => buildSegments(roleta?.options ?? []), [roleta?.options]);
  
  const segmentsWithPercentages = useMemo(() => {
    if (!segments.length) return [];
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 0), 0);
    const effectiveTotal = totalWeight > 0 ? totalWeight : segments.length;
    return segments.map((segment) => {
      const currentWeight = segment.weight || (effectiveTotal / segments.length);
      const percentage = effectiveTotal > 0 ? (currentWeight / effectiveTotal) * 100 : 100 / segments.length;
      return {
        ...segment,
        percentage: percentage.toFixed(2).replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1'),
      };
    });
  }, [segments]);

const rotation = useMemo(
  () =>
    spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
      extrapolate: 'extend',
    }),
  [spinValue]
);

const handleSpin = useCallback(() => {
  if (!segments.length || spinning) return;

  const result = chooseWeightedSegment(segments);
  if (!result) return;

  if (!animationEnabled) {
    navigation.navigate('Result', { roletaId: roleta.id, option: result.segment });
    return;
  }

  setSpinning(true);

  // O spinValue conta voltas completas. rotationSeed guarda a fração atual (0 a 1).
  // 1 volta = 360°. A interpolação transforma 0..1 em 0deg..360deg.

  // Ângulo onde o ponteiro está (topo da tela = 270° no sistema SVG)
  const POINTER_ANGLE = 270;

  // Centro do segmento sorteado (em graus, 0° = 3h no SVG)
  const targetCenter = result.segment.startAngle + result.segment.sweepAngle / 2;

  // Ângulo final da roleta: ponteiro deve apontar para o centro do segmento
  // No SVG, roda-se a roleta em (POINTER_ANGLE - targetCenter) graus
  const stopAtDeg = (POINTER_ANGLE - targetCenter + 360) % 360;

  // Converte graus para "voltas" (fração)
  const stopAt = stopAtDeg / 360;

  // Posição atual da roleta em fração (0 a 1)
  const currentFrac = rotationSeed.current % 1;

  // Distância para frente até o alvo
  let delta = stopAt - currentFrac;
  if (delta <= 0) delta += 1;

  // Pelo menos 5 voltas completas para o efeito visual
  const totalSpins = delta + 5;
  const nextValue = rotationSeed.current + totalSpins;

  // Resetar para começar do ângulo atual
  spinValue.setValue(rotationSeed.current);

  Animated.timing(spinValue, {
    toValue: nextValue,
    duration: 5000,
    easing: Easing.out(Easing.bezier(0.2, 0, 0, 1)),
    useNativeDriver: true,
  }).start(({ finished }) => {
    if (finished) {
      rotationSeed.current = nextValue % 1;
      setSpinning(false);
      navigation.navigate('Result', {
        roletaId: roleta.id,
        option: result.segment,
      });
    }
  });
}, [spinning, animationEnabled, segments, navigation, roleta, spinValue]);

  if (!roleta) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Roleta não encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{roleta.name}</Text>
      <TouchableOpacity
        style={styles.inlineEditButton}
        onPress={() => navigation.navigate('RoletaDetail', { roletaId })}
        activeOpacity={0.7}
      >
        <Text style={styles.inlineEditText}>Editar roleta</Text>
      </TouchableOpacity>
      <WheelCanvas segments={segments} rotation={rotation} />
      
      <View style={styles.animationToggleContainer}>
        <TouchableOpacity
          style={[styles.animationToggle, animationEnabled && styles.animationToggleActive]}
          onPress={() => setAnimationEnabled(!animationEnabled)}
          activeOpacity={0.7}
        >
          <Text style={[styles.animationToggleText, animationEnabled && styles.animationToggleTextActive]}>
            {animationEnabled ? '🎬 Animação: ON' : '⚡ Animação: OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.spinButton, spinning && { opacity: 0.7 }]}
        onPress={handleSpin}
        disabled={spinning}
        activeOpacity={0.7}
      >
        <Text style={styles.spinText}>{spinning ? 'Girando...' : 'Girar'}</Text>
      </TouchableOpacity>

      <FlatList
        data={segmentsWithPercentages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OptionRow option={item} percentage={item.percentage} />}
        ListHeaderComponent={
          segmentsWithPercentages.length ? <Text style={styles.listTitle}>Probabilidades</Text> : null
        }
        contentContainerStyle={styles.list}
        removeClippedSubviews={true}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050512',
    padding: 16,
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
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  inlineEditButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2B2B55',
    marginTop: 8,
  },
  inlineEditText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  animationToggleContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  animationToggle: {
    backgroundColor: '#2B2B55',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#3B3B6B',
    minWidth: 180,
  },
  animationToggleActive: {
    backgroundColor: '#43AA8B',
    borderColor: '#43AA8B',
  },
  animationToggleText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  animationToggleTextActive: {
    color: '#050512',
  },
  spinButton: {
    marginTop: 12,
    backgroundColor: '#43AA8B',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  spinText: {
    color: '#050512',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  listTitle: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161633',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  optionWeight: {
    color: '#888',
    fontSize: 12,
  },
  optionPercentage: {
    color: '#F9C74F',
    fontSize: 13,
    fontWeight: '700',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAnimationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2B2B55',
    backgroundColor: '#2B2B55',
  },
  headerAnimationButtonActive: {
    backgroundColor: '#43AA8B',
    borderColor: '#43AA8B',
  },
  headerAnimationText: {
    color: '#888',
    fontSize: 18,
  },
  headerAnimationTextActive: {
    color: '#050512',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2B2B55',
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

