import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { Colors } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PatientDashboard from '../screens/patient/PatientDashboard';
import QueueStatusScreen from '../screens/patient/QueueStatusScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import ChatbotScreen from '../screens/patient/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import ReceptionistDashboard from '../screens/receptionist/ReceptionistDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icon Helper ──────────────────────────────────────────────────────────
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

// ─── Auth Stack ───────────────────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// ─── Patient Tabs ─────────────────────────────────────────────────────────────
const PatientTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.bgCard, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
      headerTitleStyle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
      headerTintColor: Colors.primary,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: {
        backgroundColor: Colors.bgCard,
        borderTopColor: Colors.border,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
    <Tab.Screen
      name="Dashboard"
      component={PatientDashboard}
      options={{
        title: 'QueueEase',
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="BookAppointment"
      component={BookAppointmentScreen}
      options={{
        title: 'Book your number',
        tabBarLabel: 'Book',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Chatbot"
      component={ChatbotScreen}
      options={{
        title: 'AI Assistant',
        tabBarLabel: 'Assist',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'My Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// Patient Stack (tab + extra screens)
const PatientStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PatientTabs" component={PatientTabs} />
    <Stack.Screen
      name="QueueStatus"
      component={QueueStatusScreen}
      options={{ headerShown: true, title: 'Live queue status', headerTintColor: Colors.primary, headerStyle: { backgroundColor: Colors.bgCard }, headerTitleStyle: { fontWeight: '700' } }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: true, title: 'Settings', headerTintColor: Colors.primary, headerStyle: { backgroundColor: Colors.bgCard }, headerTitleStyle: { fontWeight: '700' } }}
    />
  </Stack.Navigator>
);

// ─── Doctor Tabs ──────────────────────────────────────────────────────────────
const DoctorTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.bgCard, elevation: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
      headerTitleStyle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
      tabBarActiveTintColor: Colors.primaryDark,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
    <Tab.Screen
      name="DoctorQueue"
      component={DoctorDashboard}
      options={{ title: 'Queue Management', tabBarLabel: 'Queue', tabBarIcon: ({ focused }) => <TabIcon emoji="🩺" focused={focused} /> }}
    />
    <Tab.Screen
      name="DoctorProfile"
      component={ProfileScreen}
      options={{ title: 'My Profile', tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

// ─── Receptionist Tabs ────────────────────────────────────────────────────────
const ReceptionistTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.bgCard, elevation: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
      headerTitleStyle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
    <Tab.Screen
      name="ReceptionQueue"
      component={ReceptionistDashboard}
      options={{ title: 'Queue Manager', tabBarLabel: 'Manage', tabBarIcon: ({ focused }) => <TabIcon emoji="🗂️" focused={focused} /> }}
    />
    <Tab.Screen
      name="ReceptionProfile"
      component={ProfileScreen}
      options={{ title: 'My Profile', tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────
const RootNavigator = () => {
  const { isAuthenticated, isInitialized, role } = useAuthStore();

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: 'push' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          {role === 'patient' && <Stack.Screen name="Patient" component={PatientStack} />}
          {role === 'doctor' && <Stack.Screen name="Doctor" component={DoctorTabs} />}
          {role === 'receptionist' && <Stack.Screen name="Receptionist" component={ReceptionistTabs} />}
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
