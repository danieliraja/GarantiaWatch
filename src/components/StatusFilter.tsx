import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { WarrantyStatus } from '../types/warranty';

interface Props {
  current: WarrantyStatus | 'todas';
  onChange: (status: WarrantyStatus | 'todas') => void;
}

export const STATUS_FILTER_OPTIONS: Array<{
  value: WarrantyStatus | 'todas';
  label: string;
}> = [
  { value: 'todas', label: 'Todas' },
  { value: 'ativa', label: 'Ativas' },
  { value: 'vencendo', label: 'Vencendo' },
  { value: 'vencida', label: 'Vencidas' }
];

const StatusFilter: React.FC<Props> = ({ current, onChange }) => {

  return (
    <View style={styles.container}>
      {STATUS_FILTER_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          mode={current === option.value ? 'flat' : 'outlined'}
          selected={current === option.value}
          onPress={() => onChange(option.value)}
          style={styles.chip}
        >
          {option.label}
        </Chip>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12
  },
  chip: {
    marginRight: 8,
    marginBottom: 8
  }
});

export default StatusFilter;
