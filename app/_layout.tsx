import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="currency-picker"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Selecionar Moeda',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#37517e',
          }}
        />
        <Stack.Screen
          name="compare/index"
          options={{
            headerShown: true,
            title: 'Comparar Provedores',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#37517e',
          }}
        />
        <Stack.Screen
          name="alerts/index"
          options={{
            headerShown: true,
            title: 'Alertas de Câmbio',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#37517e',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
