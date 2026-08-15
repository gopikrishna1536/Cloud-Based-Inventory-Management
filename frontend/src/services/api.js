import axios from 'axios';
import { mockProducts, mockCategories, mockSuppliers, demoUsers } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Store local in-memory fallback state for Netlify live preview mode
let localProducts = [...mockProducts];
let localTransactions = [
  {
    _id: 'tx_1',
    productId: { _id: 'prod_1', name: 'Dell XPS 13 Laptop', sku: 'LAP001', barcode: '8901234567891' },
    type: 'PURCHASE',
    quantity: 10,
    previousStock: 2,
    newStock: 12,
    createdBy: { _id: 'usr_admin_1', name: 'Sarah Connor' },
    reason: 'Initial stock intake',
    createdAt: new Date(),
  },
];
let localSales = [];

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockcloud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error & Netlify Offline Fallback Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('stockcloud_token');
      localStorage.removeItem('stockcloud_user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // If Network Error occurs on Netlify / Static Deployment, serve mock data gracefully
    if (isNetworkError && error.config) {
      const url = error.config.url || '';
      const method = (error.config.method || 'get').toLowerCase();

      console.warn(`[Netlify Demo Fallback] ${method.toUpperCase()} ${url} - Serving mock client response.`);

      // 1. /auth/me
      if (url.includes('/auth/me')) {
        const savedUser = localStorage.getItem('stockcloud_user');
        const user = savedUser ? JSON.parse(savedUser) : demoUsers[0];
        return Promise.resolve({ data: { success: true, user } });
      }

      // 2. /products/barcode/:barcode
      if (url.includes('/products/barcode/')) {
        const barcodeVal = url.split('/products/barcode/')[1]?.trim();
        const prod = localProducts.find((p) => p.barcode === barcodeVal);
        if (prod) {
          return Promise.resolve({ data: { success: true, data: prod } });
        }
        return Promise.reject({
          response: { status: 404, data: { success: false, message: 'No product associated with this barcode' } },
        });
      }

      // 3. /scanner/scan
      if (url.includes('/scanner/scan')) {
        let reqData = {};
        try {
          reqData = JSON.parse(error.config.data || '{}');
        } catch (e) {}

        const barcodeVal = reqData.barcode?.trim();
        const prod = localProducts.find((p) => p.barcode === barcodeVal);

        if (prod) {
          return Promise.resolve({
            data: {
              success: true,
              message: 'Product identified successfully',
              product: {
                ...prod,
                id: prod._id,
                stockStatus: prod.stock === 0 ? 'OUT_OF_STOCK' : prod.stock <= prod.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK',
                category: prod.categoryId?.name || 'General',
                supplier: prod.supplierId?.company || 'Supplier Co',
              },
            },
          });
        }
        return Promise.reject({
          response: { status: 404, data: { success: false, message: 'Product not found for this barcode' } },
        });
      }

      // 4. /products
      if (url.includes('/products')) {
        if (method === 'get') {
          return Promise.resolve({
            data: {
              success: true,
              data: localProducts,
              pagination: { total: localProducts.length, page: 1, pages: 1 },
            },
          });
        }
        if (method === 'post') {
          let reqData = {};
          try {
            reqData = JSON.parse(error.config.data || '{}');
          } catch (e) {}
          const newProd = {
            _id: `prod_${Date.now()}`,
            name: reqData.name || 'New Product',
            sku: (reqData.sku || 'SKU').toUpperCase(),
            barcode: reqData.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
            purchasePrice: Number(reqData.purchasePrice) || 100,
            sellingPrice: Number(reqData.sellingPrice) || 150,
            stock: Number(reqData.stock) || 10,
            reorderLevel: Number(reqData.reorderLevel) || 5,
            categoryId: { _id: 'cat_1', name: 'General' },
            supplierId: { _id: 'sup_1', company: 'Supplier Co' },
            createdAt: new Date(),
          };
          localProducts.unshift(newProd);
          return Promise.resolve({ data: { success: true, data: newProd } });
        }
      }

      // 5. /categories
      if (url.includes('/categories')) {
        return Promise.resolve({ data: { success: true, data: mockCategories } });
      }

      // 6. /suppliers
      if (url.includes('/suppliers')) {
        return Promise.resolve({ data: { success: true, data: mockSuppliers } });
      }

      // 7. /inventory/stock-in
      if (url.includes('/inventory/stock-in')) {
        let reqData = {};
        try {
          reqData = JSON.parse(error.config.data || '{}');
        } catch (e) {}
        const prod = localProducts.find((p) => p._id === reqData.productId);
        if (prod) {
          const prev = prod.stock;
          prod.stock += Number(reqData.quantity || 1);
          const tx = {
            _id: `tx_${Date.now()}`,
            productId: { _id: prod._id, name: prod.name, sku: prod.sku, barcode: prod.barcode },
            type: 'PURCHASE',
            quantity: Number(reqData.quantity || 1),
            previousStock: prev,
            newStock: prod.stock,
            createdBy: { name: 'Demo User' },
            reason: 'Barcode Stock-In',
            createdAt: new Date(),
          };
          localTransactions.unshift(tx);
          return Promise.resolve({ data: { success: true, message: 'Stock In completed', data: { product: prod, transaction: tx } } });
        }
      }

      // 8. /inventory/adjust
      if (url.includes('/inventory/adjust')) {
        let reqData = {};
        try {
          reqData = JSON.parse(error.config.data || '{}');
        } catch (e) {}
        const prod = localProducts.find((p) => p._id === reqData.productId);
        if (prod) {
          const prev = prod.stock;
          const delta = Number(reqData.quantity || 0);
          prod.stock += delta;
          const tx = {
            _id: `tx_${Date.now()}`,
            productId: { _id: prod._id, name: prod.name, sku: prod.sku, barcode: prod.barcode },
            type: reqData.type || 'ADJUSTMENT',
            quantity: delta,
            previousStock: prev,
            newStock: prod.stock,
            createdBy: { name: 'Demo User' },
            reason: reqData.reason || 'Stock Adjustment',
            createdAt: new Date(),
          };
          localTransactions.unshift(tx);
          return Promise.resolve({ data: { success: true, message: 'Stock adjusted', data: { product: prod, transaction: tx } } });
        }
      }

      // 9. /inventory/transactions
      if (url.includes('/inventory/transactions')) {
        return Promise.resolve({ data: { success: true, data: localTransactions, pagination: { total: localTransactions.length, page: 1, pages: 1 } } });
      }

      // 10. /inventory
      if (url.includes('/inventory')) {
        let totalItems = 0, totalValue = 0, lowStockCount = 0, outOfStockCount = 0;
        localProducts.forEach((p) => {
          totalItems += p.stock;
          totalValue += p.stock * p.purchasePrice;
          if (p.stock === 0) outOfStockCount++;
          else if (p.stock <= p.reorderLevel) lowStockCount++;
        });

        return Promise.resolve({
          data: {
            success: true,
            stats: { totalProducts: localProducts.length, totalItems, totalValue, lowStockCount, outOfStockCount },
            data: localProducts,
            pagination: { total: localProducts.length, page: 1, pages: 1 },
          },
        });
      }

      // 11. /sales
      if (url.includes('/sales')) {
        if (method === 'post') {
          let reqData = {};
          try {
            reqData = JSON.parse(error.config.data || '{}');
          } catch (e) {}
          const newSale = {
            _id: `sale_${Date.now()}`,
            customer: reqData.customer || { name: 'Walk-in Customer' },
            items: reqData.items || [],
            subtotal: 100,
            totalAmount: 100,
            totalProfit: 25,
            createdAt: new Date(),
          };
          localSales.unshift(newSale);
          return Promise.resolve({ data: { success: true, data: newSale } });
        }
        return Promise.resolve({ data: { success: true, data: localSales, pagination: { total: localSales.length, page: 1, pages: 1 } } });
      }

      // 12. /purchases
      if (url.includes('/purchases')) {
        return Promise.resolve({ data: { success: true, data: [], pagination: { total: 0, page: 1, pages: 1 } } });
      }

      // 13. /dashboard/stats
      if (url.includes('/dashboard/stats')) {
        let totalInventoryValue = 0, lowStockCount = 0, outOfStockCount = 0;
        localProducts.forEach((p) => {
          totalInventoryValue += p.stock * p.purchasePrice;
          if (p.stock === 0) outOfStockCount++;
          else if (p.stock <= p.reorderLevel) lowStockCount++;
        });
        return Promise.resolve({
          data: {
            success: true,
            stats: {
              totalProducts: localProducts.length,
              totalInventoryValue,
              lowStockCount,
              outOfStockCount,
              totalSuppliers: mockSuppliers.length,
              todaysSales: 24500,
              monthlySales: 185000,
              totalPurchases: 120000,
            },
            charts: {
              categoryBreakdown: [
                { name: 'Laptops', value: 250000 },
                { name: 'Mobile Devices', value: 180000 },
                { name: 'Peripherals', value: 45000 },
              ],
              monthlyComparison: [
                { month: 'Jan', sales: 120000, purchases: 90000 },
                { month: 'Feb', sales: 150000, purchases: 110000 },
                { month: 'Mar', sales: 185000, purchases: 120000 },
              ],
              topSellingProducts: localProducts.slice(0, 5).map((p) => ({ name: p.name, sku: p.sku, quantity: 15, revenue: p.sellingPrice * 15 })),
            },
            lowStockAlerts: localProducts.filter((p) => p.stock <= p.reorderLevel),
            recentSales: localSales,
          },
        });
      }

      // 14. /reports
      if (url.includes('/reports')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }

      // 15. /users
      if (url.includes('/users')) {
        return Promise.resolve({ data: { success: true, data: demoUsers } });
      }

      // 16. /subscription
      if (url.includes('/subscription')) {
        return Promise.resolve({ data: { success: true, data: { plan: 'PRO', status: 'ACTIVE' } } });
      }

      // 17. /settings
      if (url.includes('/settings')) {
        return Promise.resolve({ data: { success: true, data: { companyName: 'ABC Electronics' } } });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
