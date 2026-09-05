// Product Controller
import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productService.getAllProducts();
    sendSuccess(res, products, 'Product catalog retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
}
