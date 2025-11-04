import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WarrantyListScreen from '../screens/WarrantyListScreen';
import NewWarrantyScreen from '../screens/NewWarrantyScreen';
import WarrantyDetailScreen from '../screens/WarrantyDetailScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useWarranties } from '../context/WarrantyContext';
import { determineStatus } from '../utils/date';

export type AppStackParamList = {
  Root: undefined;
  NewWarranty: undefined;
  WarrantyDetail: { warrantyId: string };
};

export type RootTabParamList = {
  Garantias: undefined;
  Alertas: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => {
  const { warranties } = useWarranties();
  const expiringCount = warranties.filter((warranty) => determineStatus(warranty) === 'vencendo').length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1C1F26', borderTopColor: '#0F1115' },
        tabBarActiveTintColor: '#FAD02C',
        tabBarInactiveTintColor: '#9AA0A6',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'watch';
          if (route.name === 'Garantias') {
            iconName = 'clipboard-list-outline';
          } else if (route.name === 'Alertas') {
            iconName = 'bell-alert-outline';
          } else if (route.name === 'Perfil') {
            iconName = 'account-circle-outline';
          }
          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Garantias" component={WarrantyListScreen} />
      <Tab.Screen
        name="Alertas"
        component={AlertsScreen}
        options={{ tabBarBadge: expiringCount > 0 ? expiringCount : undefined }}
      />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Root" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen
      name="NewWarranty"
      component={NewWarrantyScreen}
      options={{ title: 'Nova Garantia', headerStyle: { backgroundColor: '#1C1F26' }, headerTintColor: '#FAD02C' }}
    />
    <Stack.Screen
      name="WarrantyDetail"
      component={WarrantyDetailScreen}
      options={{ title: 'Detalhes da Garantia', headerStyle: { backgroundColor: '#1C1F26' }, headerTintColor: '#FAD02C' }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
