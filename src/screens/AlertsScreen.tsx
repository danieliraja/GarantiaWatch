import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useWarranties } from '../context/WarrantyContext';
import { determineStatus, formatDate } from '../utils/date';

const AlertsScreen: React.FC = () => {
  const { warranties } = useWarranties();
  const relevant = warranties.filter((warranty) => {
    const status = determineStatus(warranty);
    return status === 'vencendo' || status === 'vencida';
  });

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Alertas e notificações
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Receba avisos automáticos para garantir o pós-venda dos seus clientes.
      </Text>
      <FlatList
        data={relevant}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.client_name} • vence em ${formatDate(item.due_date)}`}
            description={`Telefone: ${item.client_phone}\nTroca: ${formatDate(item.exchange_date)}`}
            left={(props) => <List.Icon {...props} icon={determineStatus(item) === 'vencida' ? 'alert-circle' : 'bell-alert'} />}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={<Text>Nenhuma garantia crítica no momento.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 16
  },
  title: {
    color: '#FAD02C',
    marginBottom: 8
  },
  subtitle: {
    color: '#9AA0A6',
    marginBottom: 16
  },
  listContent: {
    paddingBottom: 40
  },
  listItem: {
    backgroundColor: '#1C1F26',
    borderRadius: 16,
    marginBottom: 12
  }
});

export default AlertsScreen;
