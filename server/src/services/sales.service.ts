// Sales Service Layer
import { Sale } from '../types/index.js';

export class SalesService {
  private mockSales: Sale[] = [
    {
      id: 'REC-98231',
      receiptNumber: 'REC-98231',
      storeId: 'store-101',
      cashierId: 'usr-101',
      customerName: 'Sarah Connor',
      subtotal: 249.99,
      taxAmount: 20.00,
      discountAmount: 0,
      totalAmount: 269.99,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    }
  ];

  public async getSales(): Promise<Sale[]> {
    return this.mockSales;
  }

  public async createSale(saleData: Partial<Sale>): Promise<Sale> {
    const newSale: Sale = {
      id: `REC-${Math.floor(10000 + Math.random()*90000)}`,
      receiptNumber: `REC-${Math.floor(10000 + Math.random()*90000)}`,
      storeId: saleData.storeId || 'store-101',
      cashierId: saleData.cashierId || 'usr-101',
      customerName: saleData.customerName || 'Walk-in Customer',
      subtotal: saleData.subtotal || 100.00,
      taxAmount: saleData.taxAmount || 8.00,
      discountAmount: saleData.discountAmount || 0,
      totalAmount: saleData.totalAmount || 108.00,
      paymentMethod: saleData.paymentMethod || 'CARD',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    this.mockSales.unshift(newSale);
    return newSale;
  }
}

export const salesService = new SalesService();
