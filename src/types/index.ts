export interface ProductImage {
  id: string;
  url: string; // Either '/src/assets/images/...' or 'idb://<imageId>'
  alt?: string;
  angleLabel?: string; // e.g., "Front View", "Back / Side View", "Fabric Detail", "Lifestyle"
  isMain?: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string; // e.g. "Indigo / M"
  size: string;
  colour: string;
  colourHex: string;
  sku: string;
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  images: string[]; // URLs or 'idb://' keys specific to this colour/variant
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  audience?: 'women' | 'men' | 'unisex';
  description: string;
  material: string;
  careInstructions: string;
  fit: string;
  skuPrefix: string;
  sellingPrice: number; // Base / starting price
  originalPrice: number;
  images: ProductImage[];
  variants: ProductVariant[];
  keywords: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isTrending?: boolean;
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string; // URL or 'idb://'
  audience?: 'women' | 'men' | 'all';
  order: number;
  isActive: boolean;
}

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string; // Simulated frontend-only demo storage
  addresses: Address[];
  createdAt: string;
}

export interface CartItem {
  id: string; // `${productId}__${variantId}`
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  size: string;
  colour: string;
  colourHex: string;
  sku: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  image: string;
  maxStock: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  size: string;
  colour: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

export interface OrderCustomerDetails {
  customerId?: string;
  fullName: string;
  mobile: string;
  whatsappNumber: string;
  email?: string;
  house: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  deliveryInstructions?: string;
}

export interface Order {
  id: string; // e.g. FLV-000001
  customer: OrderCustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  whatsappLaunched: boolean;
  whatsappMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountLabel: string;
  targetUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShopStyleCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  targetUrl: string;
}

export interface SiteContent {
  heroLabel: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  promoLabel: string;
  promoHeading: string;
  promoSubheading: string;
  promoImage: string;
  featuredLabel: string;
  featuredHeading: string;
  featuredSubheading: string;
  featuredImage: string;
  specialBannerLabel?: string;
  specialBannerHeading?: string;
  specialBannerSubheading?: string;
  specialBannerImage?: string;
  shopYourStyleItems?: ShopStyleCard[];
  instagramHeading: string;
  instagramHandle: string;
  instagramGallery: string[];
  footerTagline: string;
}

export interface AdminSettings {
  storeName: string;
  storeLogoText: string;
  storeLogoImage?: string;
  whatsappNumber: string; // International format without + or spaces e.g. 919744296860
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  currency: 'INR';
  aboutContent: string;
  shippingPolicy: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}
