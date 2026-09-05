// Retail Sales and Inventory Copilot (TRACK_DIPHS08)
// Core Backend Data Models & API Types

export type UserRole = 'SUPER_ADMIN' | 'STORE_MANAGER' | 'INVENTORY_SPECIALIST' | 'CASHIER' | 'AUDITOR';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  storeId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  basePrice: number;
  costPrice: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  targetStockLevel: number;
  locationRack: string;
  updatedAt: string;
}

export type MovementType = 'SALE' | 'PURCHASE_RECEIPT' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_REMOVE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN';

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  type: MovementType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string;
  performedBy?: string;
  reason?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  storeId: string;
  cashierId: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'SPLIT';
  paymentStatus: 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  storeId: string;
  status: 'DRAFT' | 'AI_RECOMMENDED' | 'APPROVED' | 'SENT' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  createdBy?: string;
  expectedDelivery: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
