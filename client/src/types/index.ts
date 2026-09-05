export type TabType = 'dashboard' | 'pos' | 'inventory' | 'products' | 'suppliers' | 'sales' | 'analytics' | 'copilot';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  basePrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  image: string;
}

export interface MetricSummary {
  revenue: number;
  grossMargin: number;
  lowStockAlertsCount: number;
  totalSkus: number;
}
