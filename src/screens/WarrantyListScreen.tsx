import React, { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import WarrantyCard from '../components/WarrantyCard';
import StatusFilter from '../components/StatusFilter';
import { useWarranties } from '../context/WarrantyContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { determineStatus } from '../utils/date';

const WarrantyListScreen: React.FC = () => {
  const { filteredWarranties, statusFilter, setStatusFilter, warranties, refresh, loading } = useWarranties();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const stats = useMemo(() => {
    return {
      total: warranties.length,
      active: warranties.filter((warranty) => determineStatus(warranty) === 'ativa').length,
      expiring: warranties.filter((warranty) => determineStatus(warranty) === 'vencendo').length,
      expired: warranties.filter((warranty) => determineStatus(warranty) === 'vencida').length
    };
  }, [warranties]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Minhas garantias
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Total: {stats.total} | Ativas: {stats.active} | Vencendo: {stats.expiring} | Vencidas: {stats.expired}
        </Text>
        <StatusFilter current={statusFilter} onChange={setStatusFilter} />
      </View>
      <FlatList
        data={filteredWarranties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <WarrantyCard warranty={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListEmptyComponent={<Text>Nenhuma garantia cadastrada.</Text>}
      />
      <FAB style={styles.fab} icon="plus" onPress={() => navigation.navigate('NewWarranty')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 16
  },
  header: {
    marginBottom: 12
  },
  title: {
    color: '#FAD02C',
    marginBottom: 4
  },
  subtitle: {
    color: '#9AA0A6'
  },
  listContent: {
    paddingBottom: 120
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    backgroundColor: '#FAD02C'
  }
});

export default WarrantyListScreen;
