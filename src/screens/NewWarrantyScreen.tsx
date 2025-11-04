import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWarranties } from '../context/WarrantyContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { toISODateString } from '../utils/date';

const NewWarrantyScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { createWarranty } = useWarranties();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [exchangeDate, setExchangeDate] = useState(() => toISODateString(new Date()));
  const [warrantyDays, setWarrantyDays] = useState('90');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permita acesso à galeria para enviar imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!clientName || !clientPhone || !exchangeDate || !warrantyDays) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createWarranty({
        client_name: clientName,
        client_phone: clientPhone,
        exchange_date: exchangeDate,
        warranty_days: Number(warrantyDays),
        notes,
        image_uri: imageUri
      });
      navigation.goBack();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Registrar nova garantia
      </Text>
      <TextInput label="Nome do cliente" value={clientName} onChangeText={setClientName} style={styles.input} />
      <TextInput
        label="Telefone"
        value={clientPhone}
        onChangeText={setClientPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Data da troca"
        value={exchangeDate}
        onChangeText={setExchangeDate}
        placeholder="AAAA-MM-DD"
        style={styles.input}
      />
      <TextInput
        label="Período de garantia (dias)"
        value={warrantyDays}
        onChangeText={setWarrantyDays}
        keyboardType="number-pad"
        style={styles.input}
      />
      <TextInput
        label="Observações"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        style={styles.input}
      />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      <Button mode="outlined" onPress={handlePickImage} style={styles.input}>
        {imageUri ? 'Alterar imagem' : 'Adicionar imagem do relógio'}
      </Button>
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button mode="contained" onPress={handleSubmit} loading={loading}>
        Salvar garantia
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0F1115'
  },
  title: {
    color: '#FAD02C',
    marginBottom: 16
  },
  input: {
    marginBottom: 12
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12
  }
});

export default NewWarrantyScreen;
