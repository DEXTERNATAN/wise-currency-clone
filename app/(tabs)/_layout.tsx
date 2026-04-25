import { Tabs } from 'expo-router';

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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Convert', tabBarIcon: ({ color }) => TabIcon('💱', color) }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favorites', tabBarIcon: ({ color }) => TabIcon('⭐', color) }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color }) => TabIcon('📈', color) }}
      />
    </Tabs>
  );
}

function TabIcon(emoji: string, _color: string) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}
