import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, List, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Avatar.Icon icon="account-cog" size={96} style={styles.avatar} />
      <Text variant="headlineSmall" style={styles.title}>
        {user?.email ?? 'Perfil'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Gerencie suas informações e notificações.
      </Text>
      <List.Section style={styles.section}>
        <List.Item title="E-mail" description={user?.email ?? '-'} left={(props) => <List.Icon {...props} icon="email" />} />
        <List.Item
          title="ID do usuário"
          description={user?.id ?? '-'}
          left={(props) => <List.Icon {...props} icon="card-account-details-outline" />}
        />
      </List.Section>
      <Button mode="contained" onPress={signOut} style={styles.button}>
        Sair
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    alignItems: 'center',
    padding: 24
  },
  avatar: {
    backgroundColor: '#FAD02C',
    marginBottom: 16
  },
  title: {
    color: '#FFFFFF'
  },
  subtitle: {
    color: '#9AA0A6',
    textAlign: 'center',
    marginBottom: 24
  },
  section: {
    alignSelf: 'stretch'
  },
  button: {
    marginTop: 24,
    alignSelf: 'stretch'
  }
});

export default ProfileScreen;
