import { Warranty, WarrantyStatus } from '../types/warranty';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const calculateDueDate = (exchangeDate: string, warrantyDays: number): string => {
  const start = new Date(exchangeDate);
  const due = new Date(start.getTime() + warrantyDays * MS_IN_DAY);
  return due.toISOString();
};

export const determineStatus = (warranty: Pick<Warranty, 'due_date'>): WarrantyStatus => {
  const dueDate = new Date(warranty.due_date);
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();

  if (diff < 0) {
    return 'vencida';
  }

  if (diff <= 7 * MS_IN_DAY) {
    return 'vencendo';
  }

  return 'ativa';
};

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return Intl.DateTimeFormat('pt-BR').format(date);
};

export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};
