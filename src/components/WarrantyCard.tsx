import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Warranty } from '../types/warranty';
import { determineStatus, formatDate } from '../utils/date';

interface Props {
  warranty: Warranty;
}

const statusLabels = {
  ativa: 'Ativa',
  vencendo: 'Vencendo',
  vencida: 'Vencida'
} as const;

const WarrantyCard: React.FC<Props> = ({ warranty }) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const status = determineStatus(warranty);

  return (
    <View style={styles.card}>
      {warranty.image_url ? (
        <Image source={{ uri: warranty.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.placeholder }}>Sem imagem</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          {warranty.client_name}
        </Text>
        <Text style={styles.subtitle}>Troca em {formatDate(warranty.exchange_date)}</Text>
        <Text>Status: {statusLabels[status]}</Text>
        <Text>Vence em {formatDate(warranty.due_date)}</Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('WarrantyDetail', { warrantyId: warranty.id })}
        >
          Detalhes
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1C1F26',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12
  },
  imagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  title: {
    marginBottom: 4,
    fontWeight: '600'
  },
  subtitle: {
    color: '#9AA0A6',
    marginBottom: 8
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 12
  }
});

export default WarrantyCard;
