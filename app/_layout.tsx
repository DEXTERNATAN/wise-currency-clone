import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="currency-picker"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Select Currency',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#37517e',
          }}
        />
      </Stack>
    </>
  );
}
