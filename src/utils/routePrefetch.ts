const prefetched = new Set<string>();

type Importer = () => Promise<unknown>;

const ROUTE_IMPORTERS: Array<{ match: (path: string) => boolean; load: Importer; key: string }> = [
  {
    key: 'shop',
    match: (p) =>
      p === '/shop' ||
      p === '/women' ||
      p === '/men' ||
      p === '/new-arrivals' ||
      p === '/collections' ||
      p === '/best-sellers' ||
      p === '/offers' ||
      p.startsWith('/category/') ||
      p.startsWith('/search'),
    load: () => import('../pages/ShopPage'),
  },
  {
    key: 'product',
    match: (p) => p.startsWith('/product/'),
    load: () => import('../pages/ProductDetailPage'),
  },
  {
    key: 'cart',
    match: (p) => p === '/cart',
    load: () => import('../pages/CartPage'),
  },
  {
    key: 'wishlist',
    match: (p) => p === '/wishlist',
    load: () => import('../pages/WishlistPage'),
  },
  {
    key: 'checkout',
    match: (p) => p === '/checkout',
    load: () => import('../pages/CheckoutPage'),
  },
  {
    key: 'auth',
    match: (p) => p === '/login' || p === '/register' || p === '/forgot-password',
    load: () => import('../pages/AuthPages'),
  },
  {
    key: 'account',
    match: (p) => p.startsWith('/account'),
    load: () => import('../pages/AccountPage'),
  },
];

export function prefetchRoute(path: string): void {
  if (!path || path === '/') return;
  for (const entry of ROUTE_IMPORTERS) {
    if (entry.match(path)) {
      if (!prefetched.has(entry.key)) {
        prefetched.add(entry.key);
        entry.load().catch(() => {
          prefetched.delete(entry.key);
        });
      }
      break;
    }
  }
}

export function scheduleIdlePrefetch(): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    prefetchRoute('/women');
    prefetchRoute('/product/_');
    prefetchRoute('/cart');
  };
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(run, { timeout: 1500 });
  } else {
    window.setTimeout(run, 900);
  }
}
