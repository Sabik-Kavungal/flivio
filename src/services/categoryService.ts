import { Category } from '../types';
import { slugify } from '../utils/format';
import { ensureSeeded, readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const categoryService = {
  getAll(): Category[] {
    ensureSeeded();
    const list = readStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    return [...list].sort((a, b) => a.order - b.order);
  },

  getActive(): Category[] {
    return this.getAll().filter((c) => c.isActive);
  },

  getBySlug(slug: string): Category | undefined {
    return this.getAll().find((c) => c.slug === slug);
  },

  saveAll(categories: Category[]): Category[] {
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories;
  },

  create(input: Omit<Category, 'id'>): Category {
    const all = this.getAll();
    const id = `cat_${Date.now()}`;
    const baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
    const uniqueSlug = all.some((c) => c.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-3)}` : baseSlug;
    const category: Category = {
      ...input,
      id,
      slug: uniqueSlug,
    };
    const next = [...all, category].sort((a, b) => a.order - b.order);
    this.saveAll(next);
    return category;
  },

  update(id: string, updates: Partial<Category>): Category | null {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated: Category = { ...all[idx], ...updates, id };
    const next = [...all];
    next[idx] = updated;
    this.saveAll(next.sort((a, b) => a.order - b.order));
    return updated;
  },

  remove(id: string): boolean {
    const all = this.getAll();
    const next = all.filter((c) => c.id !== id);
    if (next.length === all.length) return false;
    this.saveAll(next);
    return true;
  },
};
