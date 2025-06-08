import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuthStore } from '~/store/authStore';

export default function TabLayout() {
  const role = useAuthStore((state) => state.role);
  const isLecturer = role === 'LECTURER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" size={size} color={color} />
          ),
        }}
      />

      {isLecturer ? (
        <Tabs.Screen
          name="sessions"
          options={{
            title: 'Sessions',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="event" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="sessions"
          options={{
            title: 'Sessions',
            tabBarItemStyle: { display: 'none' }, // Hide this tab for students
          }}
        />
      )}
      {!isLecturer ? (
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="fact-check" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarItemStyle: { display: 'none' }, // Hide this tab for students
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
