import { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export const WeightInput = memo(({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Peso</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={String(value ?? '')}
        onChangeText={onChange}
        placeholder="1.0"
        placeholderTextColor="#777"
        maxLength={10}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1C1C35',
    padding: 10,
    borderRadius: 8,
    color: '#fff',
  },
});

