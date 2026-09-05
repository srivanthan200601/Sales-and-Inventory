// Inventory Service Layer
import { InventoryItem, InventoryMovement } from '../types/index.js';

export class InventoryService {
  private mockInventory: InventoryItem[] = [
    {
      id: 'inv-101',
      storeId: 'store-101',
      productId: 'prod-101',
      quantityOnHand: 6,
      quantityReserved: 1,
      reorderLevel: 10,
      targetStockLevel: 30,
      locationRack: 'Aisle A - Shelf 2',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv-102',
      storeId: 'store-101',
      productId: 'prod-102',
      quantityOnHand: 4,
      quantityReserved: 0,
      reorderLevel: 8,
      targetStockLevel: 25,
      locationRack: 'Aisle A - Shelf 1',
      updatedAt: new Date().toISOString()
    }
  ];

  public async getInventory(): Promise<InventoryItem[]> {
    return this.mockInventory;
  }

  public async getLowStockAlerts(): Promise<InventoryItem[]> {
    return this.mockInventory.filter(i => i.quantityOnHand <= i.reorderLevel);
  }

  public async adjustStock(productId: string, qtyChange: number, reason: string): Promise<InventoryItem> {
    const item = this.mockInventory.find(i => i.productId === productId);
    if (item) {
      item.quantityOnHand = Math.max(0, item.quantityOnHand + qtyChange);
      item.updatedAt = new Date().toISOString();
      return item;
    }
    throw new Error('Inventory item not found');
  }
}

export const inventoryService = new InventoryService();
