import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RoletaProvider } from './src/context/RoletaContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoletaDetailScreen } from './src/screens/RoletaDetailScreen';
import { WheelScreen } from './src/screens/WheelScreen';
import { ResultScreen } from './src/screens/ResultScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#050512',
    card: '#050512',
    text: '#fff',
    border: '#1F1F3D',
    primary: '#F94144',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <RoletaProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#050512' },
              headerShadowVisible: false,
              headerTintColor: '#fff',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Decisão Épica' }} />
            <Stack.Screen
              name="RoletaDetail"
              component={RoletaDetailScreen}
              options={{ title: 'Roleta' }}
            />
            <Stack.Screen name="Wheel" component={WheelScreen} options={{ title: 'Roleta' }} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </RoletaProvider>
    </SafeAreaProvider>
  );
}
