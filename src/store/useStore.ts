import { create } from 'zustand';
import { adminService, AdminSession } from '../services/adminService';
import { cartService } from '../services/cartService';
import { categoryService } from '../services/categoryService';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { ensureSeeded } from '../services/storage';
import { wishlistService } from '../services/wishlistService';
import {
  AdminSettings,
  CartItem,
  Category,
  Customer,
  Order,
  Product,
  ProductVariant,
  Promotion,
  SiteContent,
  ToastMessage,
  WishlistItem,
} from '../types';

ensureSeeded();

interface FlivioState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  customers: Customer[];
  currentCustomer: Customer | null;
  adminSession: AdminSession | null;
  settings: AdminSettings;
  siteContent: SiteContent;
  promotions: Promotion[];
  recentlyViewedIds: string[];

  // UI state
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  quickViewProductId: string | null;
  toasts: ToastMessage[];

  // Refresh / sync
  refreshAll: () => void;

  // Storefront actions
  addToCart: (product: Product, variant: ProductVariant, quantity?: number, openDrawer?: boolean) => void;
  updateCartQty: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  recordRecentlyViewed: (productId: string) => void;

  // UI actions
  setCartDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProductId: (id: string | null) => void;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Auth actions
  setCurrentCustomer: (customer: Customer | null) => void;
  setAdminSession: (session: AdminSession | null) => void;
}

export const useStore = create<FlivioState>((set, get) => ({
  products: productService.getAll(),
  categories: categoryService.getAll(),
  cart: cartService.getItems(),
  wishlist: wishlistService.getItems(),
  orders: orderService.getAll(),
  customers: customerService.getAll(),
  currentCustomer: customerService.getCurrentCustomer(),
  adminSession: adminService.getSession(),
  settings: settingsService.getSettings(),
  siteContent: settingsService.getSiteContent(),
  promotions: settingsService.getPromotions(),
  recentlyViewedIds: productService.getRecentlyViewed(),

  isCartDrawerOpen: false,
  isSearchOpen: false,
  quickViewProductId: null,
  toasts: [],

  refreshAll: () => {
    set({
      products: productService.getAll(),
      categories: categoryService.getAll(),
      cart: cartService.getItems(),
      wishlist: wishlistService.getItems(),
      orders: orderService.getAll(),
      customers: customerService.getAll(),
      currentCustomer: customerService.getCurrentCustomer(),
      adminSession: adminService.getSession(),
      settings: settingsService.getSettings(),
      siteContent: settingsService.getSiteContent(),
      promotions: settingsService.getPromotions(),
      recentlyViewedIds: productService.getRecentlyViewed(),
    });
  },

  addToCart: (product, variant, quantity = 1, openDrawer = true) => {
    if (variant.stock <= 0) {
      get().pushToast({ title: 'Out of stock', description: `${variant.variantName} is currently unavailable.`, type: 'error' });
      return;
    }
    const nextCart = cartService.addItem(product, variant, quantity);
    set({ cart: nextCart, isCartDrawerOpen: openDrawer });
    get().pushToast({
      title: 'Added to Bag',
      description: `${product.name} · ${variant.variantName}`,
      type: 'success',
    });
  },

  updateCartQty: (itemId, quantity) => {
    const nextCart = cartService.updateQuantity(itemId, quantity);
    set({ cart: nextCart });
  },

  removeFromCart: (itemId) => {
    const nextCart = cartService.removeItem(itemId);
    set({ cart: nextCart });
  },

  clearCart: () => {
    const nextCart = cartService.clear();
    set({ cart: nextCart });
  },

  toggleWishlist: (productId) => {
    const had = wishlistService.has(productId);
    const nextWishlist = wishlistService.toggle(productId);
    set({ wishlist: nextWishlist });
    get().pushToast({
      title: had ? 'Removed from Wishlist' : 'Saved to Wishlist',
      type: 'info',
    });
  },

  recordRecentlyViewed: (productId) => {
    const next = productService.addRecentlyViewed(productId);
    set({ recentlyViewedIds: next });
  },

  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setQuickViewProductId: (id) => set({ quickViewProductId: id }),

  pushToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3400);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setCurrentCustomer: (customer) => {
    set({
      currentCustomer: customer,
      customers: customerService.getAll(),
    });
  },

  setAdminSession: (session) => {
    set({ adminSession: session });
  },
}));
