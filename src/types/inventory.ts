export type SupplyReason = 'INITIAL_STOCK';

export interface SupplyItem {
  barcode: string;
  quantity: number;
}

export interface SupplyRequest {
  reason: SupplyReason;
  items: SupplyItem[];
}

export interface ApiError {
  code: string;
  error: string;
  details?: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  isWeighted?: boolean;
}
