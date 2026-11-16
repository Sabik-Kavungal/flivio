import { Address, Customer } from '../types';
import { ensureSeeded, readStorage, STORAGE_KEYS, writeStorage } from './storage';

/**
 * Frontend-only simulated customer authentication & address management service.
 * Structured so methods can later swap to REST API endpoints cleanly.
 */
export const customerService = {
  getAll(): Customer[] {
    ensureSeeded();
    return readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  },

  getCurrentCustomer(): Customer | null {
    const id = readStorage<string | null>(STORAGE_KEYS.CURRENT_CUSTOMER_ID, null);
    if (!id) return null;
    return this.getAll().find((c) => c.id === id) || null;
  },

  register(input: { name: string; email: string; mobile: string; password: string }): Customer {
    const all = this.getAll();
    const normalizedEmail = input.email.trim().toLowerCase();
    if (all.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const customer: Customer = {
      id: `cust_${Date.now()}`,
      name: input.name.trim(),
      email: normalizedEmail,
      mobile: input.mobile.trim(),
      passwordHash: input.password, // Demo-only local storage; never use plaintext in production backend
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.CUSTOMERS, [customer, ...all]);
    writeStorage(STORAGE_KEYS.CURRENT_CUSTOMER_ID, customer.id);
    return customer;
  },

  login(email: string, password: string): Customer {
    const all = this.getAll();
    const normalizedEmail = email.trim().toLowerCase();
    const found = all.find(
      (c) => c.email.toLowerCase() === normalizedEmail && c.passwordHash === password
    );
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    writeStorage(STORAGE_KEYS.CURRENT_CUSTOMER_ID, found.id);
    return found;
  },

  logout(): void {
    writeStorage(STORAGE_KEYS.CURRENT_CUSTOMER_ID, null);
  },

  updateProfile(customerId: string, updates: { name?: string; email?: string; mobile?: string }): Customer {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Account not found.');

    if (updates.email) {
      const normalized = updates.email.trim().toLowerCase();
      if (all.some((c) => c.id !== customerId && c.email.toLowerCase() === normalized)) {
        throw new Error('That email is already registered to another account.');
      }
    }

    const updated: Customer = {
      ...all[idx],
      name: updates.name?.trim() || all[idx].name,
      email: updates.email?.trim().toLowerCase() || all[idx].email,
      mobile: updates.mobile?.trim() || all[idx].mobile,
    };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.CUSTOMERS, next);
    return updated;
  },

  addAddress(customerId: string, addressInput: Omit<Address, 'id'>): Customer {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Account not found.');

    const current = all[idx];
    const newAddr: Address = {
      ...addressInput,
      id: `addr_${Date.now()}`,
      isDefault: current.addresses.length === 0 ? true : addressInput.isDefault,
    };

    const updatedAddresses = newAddr.isDefault
      ? [newAddr, ...current.addresses.map((a) => ({ ...a, isDefault: false }))]
      : [...current.addresses, newAddr];

    const updated: Customer = { ...current, addresses: updatedAddresses };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.CUSTOMERS, next);
    return updated;
  },

  updateAddress(customerId: string, addressId: string, updates: Partial<Address>): Customer {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Account not found.');

    const current = all[idx];
    let updatedAddresses = current.addresses.map((a) =>
      a.id === addressId ? { ...a, ...updates, id: addressId } : a
    );
    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
    }

    const updated: Customer = { ...current, addresses: updatedAddresses };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.CUSTOMERS, next);
    return updated;
  },

  deleteAddress(customerId: string, addressId: string): Customer {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Account not found.');

    const current = all[idx];
    let updatedAddresses = current.addresses.filter((a) => a.id !== addressId);
    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    const updated: Customer = { ...current, addresses: updatedAddresses };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.CUSTOMERS, next);
    return updated;
  },

  setDefaultAddress(customerId: string, addressId: string): Customer {
    return this.updateAddress(customerId, addressId, { isDefault: true });
  },
};
