import { WishlistItem } from '../types';
import { readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const wishlistService = {
  getItems(): WishlistItem[] {
    return readStorage<WishlistItem[]>(STORAGE_KEYS.WISHLIST, []);
  },

  toggle(productId: string): WishlistItem[] {
    const items = this.getItems();
    const exists = items.some((i) => i.productId === productId);
    const next = exists
      ? items.filter((i) => i.productId !== productId)
      : [{ productId, addedAt: new Date().toISOString() }, ...items];
    writeStorage(STORAGE_KEYS.WISHLIST, next);
    return next;
  },

  remove(productId: string): WishlistItem[] {
    const next = this.getItems().filter((i) => i.productId !== productId);
    writeStorage(STORAGE_KEYS.WISHLIST, next);
    return next;
  },

  has(productId: string): boolean {
    return this.getItems().some((i) => i.productId === productId);
  },
};
