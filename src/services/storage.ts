import {
  SEED_ADMIN_SETTINGS,
  SEED_CATEGORIES,
  SEED_CUSTOMERS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_PROMOTIONS,
  SEED_SITE_CONTENT,
} from '../data/seed';
import { CartItem, WishlistItem } from '../types';

export const STORAGE_KEYS = {
  PRODUCTS: 'flivio_products_v1',
  CATEGORIES: 'flivio_categories_v1',
  CART: 'flivio_cart_v1',
  WISHLIST: 'flivio_wishlist_v1',
  ORDERS: 'flivio_orders_v1',
  CUSTOMERS: 'flivio_customers_v1',
  CURRENT_CUSTOMER_ID: 'flivio_current_customer_id_v1',
  ADMIN_SESSION: 'flivio_admin_session_v1',
  SETTINGS: 'flivio_settings_v1',
  SITE_CONTENT: 'flivio_site_content_v1',
  PROMOTIONS: 'flivio_promotions_v1',
  RECENTLY_VIEWED: 'flivio_recently_viewed_v1',
  ORDER_SEQ: 'flivio_order_seq_v1',
  WOMENS_UPGRADE_FLAG: 'flivio_womens_upgrade_v1',
  CONTACT_V2_FLAG: 'flivio_contact_v2',
  CATALOG_3CAT_V3_FLAG: 'flivio_catalog_3cat_v3',
  CATALOG_4CAT_V4_FLAG: 'flivio_catalog_4cat_v4',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to persist data to localStorage:', err);
  }
}

export function ensureSeeded(): void {
  if (typeof window === 'undefined') return;
  if (!window.localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    writeStorage(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    writeStorage(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    writeStorage(STORAGE_KEYS.SETTINGS, SEED_ADMIN_SETTINGS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.SITE_CONTENT)) {
    writeStorage(STORAGE_KEYS.SITE_CONTENT, SEED_SITE_CONTENT);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.PROMOTIONS)) {
    writeStorage(STORAGE_KEYS.PROMOTIONS, SEED_PROMOTIONS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    writeStorage(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    writeStorage(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    writeStorage(STORAGE_KEYS.ORDER_SEQ, SEED_ORDERS.length);
  }

  // Replace cached catalogue with the 4 curated women's categories (3 reference-matched top styles + Short Kurtis)
  // while preserving existing customer accounts, sessions, and store settings.
  if (!window.localStorage.getItem(STORAGE_KEYS.CATALOG_4CAT_V4_FLAG)) {
    const validProductIds = new Set(SEED_PRODUCTS.map((p) => p.id));

    writeStorage(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    writeStorage(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    writeStorage(STORAGE_KEYS.SITE_CONTENT, SEED_SITE_CONTENT);
    writeStorage(STORAGE_KEYS.PROMOTIONS, SEED_PROMOTIONS);
    writeStorage(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    writeStorage(STORAGE_KEYS.ORDER_SEQ, SEED_ORDERS.length);

    // Prune any cart, wishlist, or recently viewed items that referenced removed products
    const existingCart = readStorage<CartItem[]>(STORAGE_KEYS.CART, []);
    writeStorage(
      STORAGE_KEYS.CART,
      existingCart.filter((item) => validProductIds.has(item.productId))
    );

    const existingWishlist = readStorage<WishlistItem[]>(STORAGE_KEYS.WISHLIST, []);
    writeStorage(
      STORAGE_KEYS.WISHLIST,
      existingWishlist.filter((item) => validProductIds.has(item.productId))
    );

    const existingRecent = readStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    writeStorage(
      STORAGE_KEYS.RECENTLY_VIEWED,
      existingRecent.filter((id) => validProductIds.has(id))
    );

    writeStorage(STORAGE_KEYS.WOMENS_UPGRADE_FLAG, '1');
    writeStorage(STORAGE_KEYS.CATALOG_3CAT_V3_FLAG, '1');
    writeStorage(STORAGE_KEYS.CATALOG_4CAT_V4_FLAG, '1');
  }

  // Update default WhatsApp order & contact number for existing sessions
  if (!window.localStorage.getItem(STORAGE_KEYS.CONTACT_V2_FLAG)) {
    const existingSettings = readStorage(STORAGE_KEYS.SETTINGS, SEED_ADMIN_SETTINGS);
    const updatedSettings = {
      ...existingSettings,
      whatsappNumber:
        !existingSettings.whatsappNumber || existingSettings.whatsappNumber === '919876543210'
          ? '919744296860'
          : existingSettings.whatsappNumber,
      contactPhone:
        !existingSettings.contactPhone || existingSettings.contactPhone === '+91 98765 43210'
          ? '+91 97442 96860'
          : existingSettings.contactPhone,
    };
    writeStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
    writeStorage(STORAGE_KEYS.CONTACT_V2_FLAG, '1');
  }
}
