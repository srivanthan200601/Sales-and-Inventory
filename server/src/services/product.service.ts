// Product Service Layer
import { Product } from '../types/index.js';

export class ProductService {
  private mockProducts: Product[] = [
    {
      id: 'prod-101',
      sku: 'EL-HP-001',
      barcode: '8901234567891',
      name: 'Pro Wireless Noise-Canceling Headphones',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      basePrice: 249.99,
      costPrice: 135.00,
      unit: 'pcs',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      isActive: true
    },
    {
      id: 'prod-102',
      sku: 'EL-SW-002',
      barcode: '8901234567892',
      name: 'Apex Ultra Smartwatch Series 5',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      basePrice: 199.50,
      costPrice: 105.00,
      unit: 'pcs',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      isActive: true
    }
  ];

  public async getAllProducts(): Promise<Product[]> {
    return this.mockProducts;
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    return this.mockProducts.find(p => p.id === id);
  }

  public async createProduct(productData: Partial<Product>): Promise<Product> {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New SKU Product',
      sku: productData.sku || `SKU-${Math.floor(Math.random()*1000)}`,
      barcode: productData.barcode || `890${Math.floor(Math.random()*1000000)}`,
      categoryId: productData.categoryId || 'cat-1',
      basePrice: productData.basePrice || 99.99,
      costPrice: productData.costPrice || 45.00,
      unit: productData.unit || 'pcs',
      isActive: true
    };
    this.mockProducts.push(newProd);
    return newProd;
  }
}

export const productService = new ProductService();
