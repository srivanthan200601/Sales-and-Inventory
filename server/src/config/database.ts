// Database Pool & ORM Client Setup
import { env } from './env.js';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    // Database Pool connection setup
    this.isConnected = true;
    console.log(`[Database] Mock PostgreSQL Pool connected to ${env.DATABASE_URL.split('@')[1] || 'localhost'}`);
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }
}

export const db = DatabaseService.getInstance();
