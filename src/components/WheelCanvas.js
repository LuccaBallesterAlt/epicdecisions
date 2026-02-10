import { memo, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const AnimatedView = Animated.createAnimatedComponent(View);
const SIZE = 320;
const RADIUS = SIZE / 2;

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
   
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    
  
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

const cartesianCache = new LRUCache(100);
const arcCache = new LRUCache(100);

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const cacheKey = `${centerX},${centerY},${radius},${angleInDegrees}`;
  if (cartesianCache.has(cacheKey)) {
    return cartesianCache.get(cacheKey);
  }
  
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  const result = {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
  
  cartesianCache.set(cacheKey, result);
  return result;
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const cacheKey = `${x},${y},${radius},${startAngle},${endAngle}`;
  if (arcCache.has(cacheKey)) {
    return arcCache.get(cacheKey);
  }
  
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const result = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
    'Z',
  ].join(' ');
  
  arcCache.set(cacheKey, result);
  return result;
};

export const WheelCanvas = memo(({ segments, rotation }) => {
  const paths = useMemo(
    () =>
      segments.map((segment) => ({
        id: segment.id,
        color: segment.color,
        d: describeArc(
          RADIUS,
          RADIUS,
          RADIUS - 8,
          segment.startAngle,
          segment.startAngle + segment.sweepAngle
        ),
        label: segment.text || '—',
        midAngle: segment.midAngle,
      })),
    [segments]
  );

  const getLabelPosition = useMemo(
    () => (midAngle) => {
      const labelRadius = RADIUS * 0.62;
      const angleInRadians = ((midAngle - 90) * Math.PI) / 180;
      return {
        x: RADIUS + labelRadius * Math.cos(angleInRadians),
        y: RADIUS + labelRadius * Math.sin(angleInRadians),
      };
    },
    []
  );

  if (!segments.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Adicione opções para girar</Text>
        <Text style={styles.emptySubtitle}>Cada opção precisa de texto, imagem e peso.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AnimatedView
        style={[
          styles.wheel,
          { transform: [{ rotate: rotation }] },
          { shouldRasterizeIOS: true, renderToHardwareTextureAndroid: true }
        ]}
      >
        <Svg width={SIZE} height={SIZE}>
          <G>
            {paths.map((path) => {
              const { x, y } = getLabelPosition(path.midAngle);
              const truncated = path.label.length > 16 ? `${path.label.slice(0, 14)}…` : path.label;
              return (
                <G key={path.id}>
                  <Path d={path.d} fill={path.color} stroke="#0C0C1A" strokeWidth={2} />
                  <SvgText
                    x={x}
                    y={y}
                    fill="#0F0F23"
                    fontSize={12}
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {truncated}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
        <View style={styles.center}>
          <Text style={styles.centerText}>Decisão Épica</Text>
        </View>
      </AnimatedView>
      <View style={styles.pointer} />
    </View>
  );
}, (prevProps, nextProps) => {
  // Otimização: só re-renderiza se segments ou rotation mudar significativamente
  return (
    prevProps.segments === nextProps.segments &&
    prevProps.rotation === nextProps.rotation
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  wheel: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: '#2A2A45',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F23',
  },
  center: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0F0F23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2C2C52',
  },
  centerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F9C74F',
    zIndex: 10,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#1A1A35',
    borderWidth: 1,
    borderColor: '#2D2D55',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#bbb',
    textAlign: 'center',
  },
});

