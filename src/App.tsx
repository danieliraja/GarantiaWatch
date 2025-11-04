import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WarrantyProvider } from './context/WarrantyContext';
import { theme } from './theme';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import LoadingOverlay from './components/LoadingOverlay';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

const RootNavigator: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status: initialStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = initialStatus;

        if (initialStatus !== 'granted') {
          const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
          finalStatus = requestedStatus;
        }

        if (!isMounted) {
          return;
        }

        const granted = finalStatus === 'granted';
        setNotificationPermissionGranted(granted);

        if (!granted) {
          Alert.alert(
            'Notificações desativadas',
            'As notificações locais estão desativadas. Você pode ativá-las nas configurações do dispositivo para receber alertas de garantias.'
          );
        }
      } catch (error) {
        console.error('Erro ao verificar permissões de notificação', error);

        if (!isMounted) {
          return;
        }

        setNotificationPermissionGranted(false);

        Alert.alert(
          'Erro de notificações',
          'Não foi possível verificar as permissões de notificações. Tente novamente ou ajuste as configurações do dispositivo.'
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (notificationPermissionGranted === false) {
      console.log('Notificações locais permanecem desativadas.');
    }
  }, [notificationPermissionGranted]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <WarrantyProvider>
            <RootNavigator />
          </WarrantyProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
