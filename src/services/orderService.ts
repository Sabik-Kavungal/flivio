import { CartItem, Order, OrderCustomerDetails, OrderItem, OrderStatus } from '../types';
import { formatINR, sanitizeWhatsappNumber } from '../utils/format';
import { productService } from './productService';
import { settingsService } from './settingsService';
import { ensureSeeded, readStorage, STORAGE_KEYS, writeStorage } from './storage';

export const orderService = {
  getAll(): Order[] {
    ensureSeeded();
    const orders = readStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById(orderId: string): Order | undefined {
    return this.getAll().find((o) => o.id === orderId);
  },

  getByCustomer(customerId: string): Order[] {
    return this.getAll().filter((o) => o.customer.customerId === customerId);
  },

  generateNextOrderId(): string {
    ensureSeeded();
    const currentSeq = readStorage<number>(STORAGE_KEYS.ORDER_SEQ, 2);
    const nextSeq = currentSeq + 1;
    writeStorage(STORAGE_KEYS.ORDER_SEQ, nextSeq);
    return `FLV-${String(nextSeq).padStart(6, '0')}`;
  },

  buildWhatsappMessage(orderId: string, customer: OrderCustomerDetails, items: OrderItem[], totalAmount: number): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flivio.store';
    const addressLine = [
      customer.house,
      customer.street,
      customer.city,
      customer.district,
      customer.state,
      `PIN: ${customer.pinCode}`,
    ]
      .filter(Boolean)
      .join(', ');

    const itemBlocks = items
      .map((item, idx) => {
        const productUrl = `${origin}/product/${item.productSlug}`;
        const publicImgNote =
          item.image && !item.image.startsWith('idb://')
            ? `\nImage: ${item.image.startsWith('http') ? item.image : `${origin}${item.image}`}`
            : '';
        return (
          `${idx + 1}. Product Name: ${item.productName}\n` +
          `Variant: ${item.variantName}\n` +
          `Size: ${item.size}\n` +
          `Colour: ${item.colour}\n` +
          `Quantity: ${item.quantity}\n` +
          `Price: ${formatINR(item.subtotal)} (${formatINR(item.unitPrice)} each)\n` +
          `Product Link: ${productUrl}${publicImgNote}`
        );
      })
      .join('\n\n');

    return (
      `NEW ORDER — FLIVIO\n\n` +
      `Order ID: ${orderId}\n\n` +
      `Customer Details:\n` +
      `Name: ${customer.fullName}\n` +
      `Mobile: ${customer.mobile}\n` +
      `WhatsApp: ${customer.whatsappNumber || customer.mobile}\n` +
      `${customer.email ? `Email: ${customer.email}\n` : ''}` +
      `Address: ${addressLine}\n\n` +
      `Order Items:\n\n` +
      `${itemBlocks}\n\n` +
      `Order Total: ${formatINR(totalAmount)}\n\n` +
      `Delivery Address:\n${addressLine}` +
      `${customer.deliveryInstructions ? `\nDelivery Note: ${customer.deliveryInstructions}` : ''}`
    );
  },

  buildWhatsappUrl(message: string): string {
    const settings = settingsService.getSettings();
    const phone = sanitizeWhatsappNumber(settings.whatsappNumber || '919744296860');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  placeOrder(customer: OrderCustomerDetails, cartItems: CartItem[]): { order: Order; whatsappUrl: string } {
    if (cartItems.length === 0) {
      throw new Error('Your shopping bag is empty.');
    }

    // Validate live stock before placing order
    const allProducts = productService.getAll();
    for (const ci of cartItems) {
      const prod = allProducts.find((p) => p.id === ci.productId);
      const variant = prod?.variants.find((v) => v.id === ci.variantId);
      if (!prod || !prod.isActive || !variant || !variant.isActive) {
        throw new Error(`${ci.productName} (${ci.variantName}) is no longer available.`);
      }
      if (variant.stock < ci.quantity) {
        throw new Error(
          `Only ${variant.stock} unit(s) left for ${ci.productName} (${ci.variantName}). Please update your bag.`
        );
      }
    }

    const orderId = this.generateNextOrderId();
    const items: OrderItem[] = cartItems.map((ci) => ({
      productId: ci.productId,
      productSlug: ci.productSlug,
      productName: ci.productName,
      variantId: ci.variantId,
      variantName: ci.variantName,
      size: ci.size,
      colour: ci.colour,
      sku: ci.sku,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,
      subtotal: ci.unitPrice * ci.quantity,
      image: ci.image,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
    const whatsappMessage = this.buildWhatsappMessage(orderId, customer, items, totalAmount);
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      customer,
      items,
      totalAmount,
      status: 'Pending',
      whatsappLaunched: false,
      whatsappMessage,
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.getAll();
    writeStorage(STORAGE_KEYS.ORDERS, [order, ...existing]);

    // Deduct stock per child variant
    productService.adjustStock(
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        delta: -i.quantity,
      }))
    );

    const whatsappUrl = this.buildWhatsappUrl(whatsappMessage);
    return { order, whatsappUrl };
  },

  markWhatsappLaunched(orderId: string): Order | null {
    const all = this.getAll();
    const idx = all.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    const updated: Order = {
      ...all[idx],
      whatsappLaunched: true,
      updatedAt: new Date().toISOString(),
    };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.ORDERS, next);
    return updated;
  },

  updateStatus(orderId: string, nextStatus: OrderStatus): Order | null {
    const all = this.getAll();
    const idx = all.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    const prevOrder = all[idx];

    // If transitioning to Cancelled from a non-cancelled state, restore inventory
    if (prevOrder.status !== 'Cancelled' && nextStatus === 'Cancelled') {
      productService.adjustStock(
        prevOrder.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          delta: i.quantity,
        }))
      );
    } else if (prevOrder.status === 'Cancelled' && nextStatus !== 'Cancelled') {
      // Restocking deduction if reactivating a cancelled order
      productService.adjustStock(
        prevOrder.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          delta: -i.quantity,
        }))
      );
    }

    const updated: Order = {
      ...prevOrder,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    const next = [...all];
    next[idx] = updated;
    writeStorage(STORAGE_KEYS.ORDERS, next);
    return updated;
  },
};
