import { Product, ProductVariant } from '../types';
import { slugify } from '../utils/format';
import { ensureSeeded, readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const productService = {
  getAll(): Product[] {
    ensureSeeded();
    return readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  getActive(): Product[] {
    return this.getAll().filter((p) => p.isActive);
  },

  getBySlug(slug: string): Product | undefined {
    return this.getAll().find((p) => p.slug === slug);
  },

  getById(id: string): Product | undefined {
    return this.getAll().find((p) => p.id === id);
  },

  saveAll(products: Product[]): Product[] {
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    return products;
  },

  create(productInput: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const all = this.getAll();
    const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const baseSlug = productInput.slug ? slugify(productInput.slug) : slugify(productInput.name);
    const uniqueSlug = all.some((p) => p.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const newProduct: Product = {
      ...productInput,
      id,
      slug: uniqueSlug,
      variants: productInput.variants.map((v) => ({ ...v, productId: id })),
      createdAt: now,
      updatedAt: now,
    };
    const next = [newProduct, ...all];
    this.saveAll(next);
    return newProduct;
  },

  update(id: string, updates: Partial<Product>): Product | null {
    const all = this.getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated: Product = {
      ...all[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    const next = [...all];
    next[idx] = updated;
    this.saveAll(next);
    return updated;
  },

  duplicate(id: string): Product | null {
    const source = this.getById(id);
    if (!source) return null;
    const copyName = `${source.name} (Copy)`;
    return this.create({
      ...source,
      name: copyName,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-3)}`,
      isActive: false,
      variants: source.variants.map((v, idx) => ({
        ...v,
        id: `var_${Date.now()}_${idx}`,
        sku: `${v.sku}-COPY`,
      })),
    });
  },

  remove(id: string): boolean {
    const all = this.getAll();
    const next = all.filter((p) => p.id !== id);
    if (next.length === all.length) return false;
    this.saveAll(next);
    return true;
  },

  updateVariant(productId: string, variantId: string, updates: Partial<ProductVariant>): Product | null {
    const product = this.getById(productId);
    if (!product) return null;
    const nextVariants = product.variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v));
    return this.update(productId, { variants: nextVariants });
  },

  adjustStock(items: { productId: string; variantId: string; delta: number }[]): void {
    const all = this.getAll();
    const next = all.map((prod) => {
      const relevant = items.filter((i) => i.productId === prod.id);
      if (relevant.length === 0) return prod;
      const updatedVariants = prod.variants.map((v) => {
        const match = relevant.find((i) => i.variantId === v.id);
        if (!match) return v;
        return { ...v, stock: Math.max(0, v.stock + match.delta) };
      });
      return { ...prod, variants: updatedVariants, updatedAt: new Date().toISOString() };
    });
    this.saveAll(next);
  },

  getRecentlyViewed(): string[] {
    return readStorage<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
  },

  addRecentlyViewed(productId: string): string[] {
    const current = this.getRecentlyViewed().filter((id) => id !== productId);
    const next = [productId, ...current].slice(0, 8);
    writeStorage(STORAGE_KEYS.RECENTLY_VIEWED, next);
    return next;
  },
};
