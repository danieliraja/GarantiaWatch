import { Warranty, WarrantyStatus } from '../types/warranty';

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const parseDateString = (value: string): Date => {
  if (DATE_ONLY_REGEX.test(value)) {
    const [yearPart, monthPart, dayPart] = value.split('-');
    const year = Number(yearPart);
    const month = Number(monthPart);
    const day = Number(dayPart);

    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }

  return new Date(value);
};

const normalizeToStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const calculateDueDate = (exchangeDate: string, warrantyDays: number): string => {
  const start = normalizeToStartOfDay(parseDateString(exchangeDate));
  const due = new Date(start);
  due.setDate(due.getDate() + warrantyDays);
  return normalizeToStartOfDay(due).toISOString();
};

export const determineStatus = (warranty: Pick<Warranty, 'due_date'>): WarrantyStatus => {
  const dueDate = normalizeToStartOfDay(parseDateString(warranty.due_date));
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

export const formatDate = (value: string): string => {
  const date = parseDateString(value);
  return Intl.DateTimeFormat('pt-BR').format(date);
};

export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};
