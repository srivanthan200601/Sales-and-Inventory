// AI Copilot Tool Declarations & Registries
export const copilotToolsRegistry = [
  {
    name: 'get_low_stock_items',
    description: 'Retrieve products that are currently at or below their reorder threshold',
    parameters: {
      type: 'object',
      properties: {
        storeId: { type: 'string', description: 'Target store branch ID' },
        limit: { type: 'number', description: 'Max items to return' }
      }
    }
  },
  {
    name: 'get_sales_analytics',
    description: 'Fetch gross revenue, profit margins, and top selling products',
    parameters: {
      type: 'object',
      properties: {
        dateRange: { type: 'string', description: 'TODAY | YESTERDAY | WEEK | MONTH' }
      }
    }
  },
  {
    name: 'draft_purchase_order',
    description: 'Generate an automated draft purchase order based on EOQ demand forecast',
    parameters: {
      type: 'object',
      properties: {
        supplierId: { type: 'string', description: 'Target vendor supplier ID' }
      }
    }
  }
];
