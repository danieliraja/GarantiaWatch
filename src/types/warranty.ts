export type WarrantyStatus = 'ativa' | 'vencendo' | 'vencida';

export interface Warranty {
  id: string;
  user_id: string;
  client_name: string;
  client_phone: string;
  exchange_date: string;
  warranty_days: number;
  due_date: string;
  notes?: string;
  image_url?: string;
  notification_id?: string;
  created_at: string;
}

export interface WarrantyInput {
  client_name: string;
  client_phone: string;
  exchange_date: string;
  warranty_days: number;
  notes?: string;
  image_uri?: string;
}
