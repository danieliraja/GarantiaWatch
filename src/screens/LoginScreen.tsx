import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const background = {
  uri: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1080&q=80'
};

const LoginScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await signUp(email, password);
      }
      await signIn(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={background} style={styles.background}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text variant="headlineLarge" style={styles.title}>
            GarantiaWatch
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Controle inteligente de garantias de relógios
          </Text>
          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {error ? <HelperText type="error">{error}</HelperText> : null}
          <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.actionButton}>
            {isRegister ? 'Criar conta' : 'Entrar'}
          </Button>
          <Button mode="text" onPress={() => setIsRegister((prev) => !prev)}>
            {isRegister ? 'Já tem conta? Faça login' : 'Criar uma nova conta'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: 'rgba(15, 17, 21, 0.9)',
    borderRadius: 24,
    padding: 24
  },
  title: {
    color: '#FAD02C',
    textAlign: 'center'
  },
  subtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24
  },
  input: {
    marginBottom: 12
  },
  actionButton: {
    marginTop: 12
  }
});

export default LoginScreen;
