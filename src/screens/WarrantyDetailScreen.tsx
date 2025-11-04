import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useWarranties } from '../context/WarrantyContext';
import { determineStatus, formatDate } from '../utils/date';

const statusDescriptions = {
  ativa: 'A garantia está ativa. Tudo certo por enquanto!',
  vencendo: 'Atenção! Essa garantia vence em breve. Entre em contato com o cliente.',
  vencida: 'Garantia expirada. Considere oferecer uma nova troca ao cliente.'
};

const statusLabels = {
  ativa: 'Ativa',
  vencendo: 'Vencendo',
  vencida: 'Vencida'
};

const WarrantyDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'WarrantyDetail'>>();
  const { warranties } = useWarranties();
  const warranty = useMemo(() => warranties.find((item) => item.id === route.params.warrantyId), [warranties, route.params.warrantyId]);

  if (!warranty) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Garantia não encontrada.</Text>
      </View>
    );
  }

  const status = determineStatus(warranty);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {warranty.image_url ? (
        <Image source={{ uri: warranty.image_url }} style={styles.image} />
      ) : (
        <Card style={styles.imagePlaceholder}>
          <Card.Content>
            <Text>Nenhuma imagem enviada</Text>
          </Card.Content>
        </Card>
      )}
      <Card style={styles.card}>
        <Card.Title title={warranty.client_name} subtitle={statusLabels[status]} />
        <Card.Content>
          <Text style={styles.statusDescription}>{statusDescriptions[status]}</Text>
          <List.Section>
            <List.Item title="Telefone" description={warranty.client_phone} left={(props) => <List.Icon {...props} icon="phone" />} />
            <List.Item
              title="Data da troca"
              description={formatDate(warranty.exchange_date)}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Validade"
              description={`${warranty.warranty_days} dias (até ${formatDate(warranty.due_date)})`}
              left={(props) => <List.Icon {...props} icon="calendar-alert" />}
            />
            {warranty.notes ? (
              <List.Item title="Observações" description={warranty.notes} left={(props) => <List.Icon {...props} icon="note" />} />
            ) : null}
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0F1115'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16
  },
  imagePlaceholder: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  card: {
    backgroundColor: '#1C1F26',
    borderRadius: 16
  },
  statusDescription: {
    marginBottom: 12
  }
});

export default WarrantyDetailScreen;
