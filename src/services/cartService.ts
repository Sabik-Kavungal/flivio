import { CartItem, Product, ProductVariant } from '../types';
import { readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const cartService = {
  getItems(): CartItem[] {
    return readStorage<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveItems(items: CartItem[]): CartItem[] {
    writeStorage(STORAGE_KEYS.CART, items);
    return items;
  },

  addItem(product: Product, variant: ProductVariant, quantity = 1): CartItem[] {
    const items = this.getItems();
    const itemId = `${product.id}__${variant.id}`;
    const existingIdx = items.findIndex((i) => i.id === itemId);
    const resolvedImage =
      variant.images?.[0] ||
      product.images.find((img) => img.isMain)?.url ||
      product.images[0]?.url ||
      '';

    if (existingIdx > -1) {
      const existing = items[existingIdx];
      const nextQty = Math.min(variant.stock, existing.quantity + quantity);
      const updated = [...items];
      updated[existingIdx] = {
        ...existing,
        unitPrice: variant.sellingPrice,
        originalPrice: variant.originalPrice,
        maxStock: variant.stock,
        quantity: Math.max(1, nextQty),
      };
      return this.saveItems(updated);
    }

    const newItem: CartItem = {
      id: itemId,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.variantName,
      size: variant.size,
      colour: variant.colour,
      colourHex: variant.colourHex,
      sku: variant.sku,
      unitPrice: variant.sellingPrice,
      originalPrice: variant.originalPrice,
      quantity: Math.min(variant.stock, Math.max(1, quantity)),
      image: resolvedImage,
      maxStock: variant.stock,
    };

    return this.saveItems([...items, newItem]);
  },

  updateQuantity(itemId: string, quantity: number): CartItem[] {
    const items = this.getItems();
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    const next = items.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.min(item.maxStock || 99, Math.max(1, quantity)) }
        : item
    );
    return this.saveItems(next);
  },

  removeItem(itemId: string): CartItem[] {
    const next = this.getItems().filter((i) => i.id !== itemId);
    return this.saveItems(next);
  },

  clear(): CartItem[] {
    return this.saveItems([]);
  },
};
