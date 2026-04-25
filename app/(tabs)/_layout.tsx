import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon(emoji: string) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#37517e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Converter', tabBarIcon: () => TabIcon('💱') }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favoritos', tabBarIcon: () => TabIcon('⭐') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Histórico', tabBarIcon: () => TabIcon('📈') }}
      />
      <Tabs.Screen
        name="multi"
        options={{ title: 'Multi', tabBarIcon: () => TabIcon('🔢') }}
      />
    </Tabs>
  );
}
