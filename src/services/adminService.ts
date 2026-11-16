import { customerService } from './customerService';
import { orderService } from './orderService';
import { productService } from './productService';
import { readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@flivio.store',
  password: 'FlivioAdmin2026',
};

export interface AdminSession {
  email: string;
  name: string;
  loggedInAt: string;
}

export const adminService = {
  getSession(): AdminSession | null {
    return readStorage<AdminSession | null>(STORAGE_KEYS.ADMIN_SESSION, null);
  },

  login(email: string, password: string): AdminSession {
    if (
      email.trim().toLowerCase() !== DEMO_ADMIN_CREDENTIALS.email ||
      password !== DEMO_ADMIN_CREDENTIALS.password
    ) {
      throw new Error('Invalid admin credentials. Use the documented demo credentials.');
    }
    const session: AdminSession = {
      email: DEMO_ADMIN_CREDENTIALS.email,
      name: 'FLIVIO Store Manager',
      loggedInAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.ADMIN_SESSION, session);
    return session;
  },

  logout(): void {
    writeStorage(STORAGE_KEYS.ADMIN_SESSION, null);
  },

  getDashboardMetrics() {
    const products = productService.getAll();
    const orders = orderService.getAll();
    const customers = customerService.getAll();

    const allVariants = products.flatMap((p) => p.variants);
    const lowStockVariants = allVariants.filter((v) => v.isActive && v.stock <= 5);
    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Processing');
    const completedOrders = orders.filter((o) => o.status === 'Delivered');
    const totalOrderValue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      totalVariants: allVariants.length,
      totalOrders: orders.length,
      pendingOrdersCount: pendingOrders.length,
      completedOrdersCount: completedOrders.length,
      totalCustomers: customers.length,
      lowStockCount: lowStockVariants.length,
      lowStockVariants,
      totalOrderValue,
    };
  },
};
