import { SEED_ADMIN_SETTINGS, SEED_SITE_CONTENT } from '../data/seed';
import { AdminSettings, Promotion, SiteContent } from '../types';
import { ensureSeeded, readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const settingsService = {
  getSettings(): AdminSettings {
    ensureSeeded();
    return readStorage<AdminSettings>(STORAGE_KEYS.SETTINGS, SEED_ADMIN_SETTINGS);
  },

  updateSettings(updates: Partial<AdminSettings>): AdminSettings {
    const next = { ...this.getSettings(), ...updates };
    writeStorage(STORAGE_KEYS.SETTINGS, next);
    return next;
  },

  getSiteContent(): SiteContent {
    ensureSeeded();
    return readStorage<SiteContent>(STORAGE_KEYS.SITE_CONTENT, SEED_SITE_CONTENT);
  },

  updateSiteContent(updates: Partial<SiteContent>): SiteContent {
    const next = { ...this.getSiteContent(), ...updates };
    writeStorage(STORAGE_KEYS.SITE_CONTENT, next);
    return next;
  },

  getPromotions(): Promotion[] {
    ensureSeeded();
    return readStorage<Promotion[]>(STORAGE_KEYS.PROMOTIONS, []);
  },

  savePromotions(promos: Promotion[]): Promotion[] {
    writeStorage(STORAGE_KEYS.PROMOTIONS, promos);
    return promos;
  },

  createPromotion(input: Omit<Promotion, 'id' | 'createdAt'>): Promotion {
    const all = this.getPromotions();
    const promo: Promotion = {
      ...input,
      id: `promo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.savePromotions([promo, ...all]);
    return promo;
  },

  updatePromotion(id: string, updates: Partial<Promotion>): Promotion[] {
    const all = this.getPromotions();
    const next = all.map((p) => (p.id === id ? { ...p, ...updates } : p));
    return this.savePromotions(next);
  },

  deletePromotion(id: string): Promotion[] {
    const next = this.getPromotions().filter((p) => p.id !== id);
    return this.savePromotions(next);
  },
};
