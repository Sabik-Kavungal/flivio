import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { formatINR } from '../../utils/format';
import { ResolvedImage } from '../common/ResolvedImage';
import { prefetchRoute } from '../../utils/routePrefetch';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All Styles', to: '/women' },
  { label: 'Embroidered Tops', to: '/category/embroidered-sleeveless-layered-tops' },
  { label: 'Korean Tops', to: '/category/korean-style-tops' },
  { label: 'Floral Tops', to: '/category/floral-printed-tops' },
  { label: 'Short Kurtis', to: '/category/short-kurtis' },
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Offers', to: '/offers' },
];

const MOBILE_QUICK_LINKS = [
  { label: 'All Styles', to: '/women' },
  { label: 'Embroidered Layered', to: '/category/embroidered-sleeveless-layered-tops' },
  { label: 'Korean-Style Tops', to: '/category/korean-style-tops' },
  { label: 'Floral Printed Tops', to: '/category/floral-printed-tops' },
  { label: 'Short Kurtis', to: '/category/short-kurtis' },
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Best Sellers', to: '/best-sellers' },
  { label: 'Offers', to: '/offers' },
];

export const StoreHeader: React.FC = () => {
  const cart = useStore((s) => s.cart);
  const wishlistCount = useStore((s) => s.wishlist.length);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const currentCustomer = useStore((s) => s.currentCustomer);
  const storeLogoText = useStore((s) => s.settings.storeLogoText);
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setCartDrawerOpen = useStore((s) => s.setCartDrawerOpen);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );
  const womenCategories = useMemo(
    () => activeCategories.filter((c) => c.audience === 'women'),
    [activeCategories]
  );
  const menCategories = useMemo(
    () => activeCategories.filter((c) => c.audience !== 'women'),
    [activeCategories]
  );

  // Close drawers automatically on navigation and lock body scroll while open
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, setSearchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen && !isSearchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isSearchOpen, setSearchOpen]);

  const q = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.skuPrefix.toLowerCase().includes(q) ||
            p.keywords.some((k) => k.toLowerCase().includes(q)) ||
            p.variants.some((v) => v.sku.toLowerCase().includes(q)))
      )
      .slice(0, 6);
  }, [products, q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ECE9E2]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 grid grid-cols-3 lg:flex items-center lg:justify-between gap-1 sm:gap-4 lg:gap-5 xl:gap-8">
          {/* Mobile/Tablet left: Hamburger */}
          <div className="flex items-center justify-self-start lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 -ml-1.5 text-[#1E2022] hover:text-[#1B2A4A] active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Zone 1: Brand Wordmark (Strictly centered on mobile/tablet, left-aligned on desktop) */}
          <Link
            to="/"
            className="justify-self-center lg:justify-self-start font-display text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.14em] text-[#1E2022] whitespace-nowrap shrink-0"
          >
            {storeLogoText || 'FLIVIO'}
          </Link>

          {/* Zone 2: Clean Single-Line Desktop Navigation fitting 1024px–1920px comfortably */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-7 min-w-0"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                className={({ isActive }) =>
                  `relative text-[12px] xl:text-[13px] font-medium tracking-wide whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                    isActive
                      ? 'text-[#1B2A4A] font-semibold'
                      : 'text-[#5C5E64] hover:text-[#1E2022]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="flivio-desktop-nav-underline"
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#1B2A4A]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Functional Icons */}
          <div className="justify-self-end flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="p-1.5 sm:p-2 text-[#1E2022] hover:text-[#1B2A4A] active:scale-95 transition-all"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link
              to={currentCustomer ? '/account' : '/login'}
              onMouseEnter={() => prefetchRoute(currentCustomer ? '/account' : '/login')}
              aria-label={currentCustomer ? 'My Account' : 'Sign In'}
              className="hidden sm:flex p-1.5 sm:p-2 text-[#1E2022] hover:text-[#1B2A4A] active:scale-95 transition-all"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            <Link
              to="/wishlist"
              onMouseEnter={() => prefetchRoute('/wishlist')}
              aria-label="Wishlist"
              className="relative flex p-1.5 sm:p-2 text-[#1E2022] hover:text-[#1B2A4A] active:scale-95 transition-all"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span
                  key={wishlistCount}
                  className="animate-badge-pop absolute top-0.5 right-0 sm:top-1 sm:right-0.5 min-w-[15px] h-[15px] px-1 bg-[#1B2A4A] text-white text-[9px] font-semibold flex items-center justify-center tabular-nums"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Open shopping bag"
              className="relative p-1.5 sm:p-2 -mr-1 sm:mr-0 text-[#1E2022] hover:text-[#1B2A4A] active:scale-95 transition-all flex items-center gap-1"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span
                key={cartCount}
                className="animate-badge-pop text-xs font-semibold tabular-nums"
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Horizontal Quick-Category Discovery Strip */}
      <div className="lg:hidden bg-[#F7F6F2] border-b border-[#ECE9E2]">
        <nav
          aria-label="Quick Categories"
          className="px-3.5 sm:px-6 py-2 flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar"
        >
          {MOBILE_QUICK_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onTouchStart={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                `text-xs font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b ${
                  isActive
                    ? 'text-[#1B2A4A] border-[#1B2A4A] font-semibold'
                    : 'text-[#5C5E64] border-transparent hover:text-[#1E2022]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Animated Slide-out Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              aria-label="Mobile Navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[86%] max-w-xs h-full bg-white flex flex-col justify-between overflow-y-auto shadow-2xl will-change-transform"
            >
              <div>
                <div className="px-5 h-16 border-b border-[#ECE9E2] flex items-center justify-between bg-[#F7F6F2]">
                  <span className="font-display text-lg font-bold tracking-[0.14em] text-[#1E2022]">
                    {storeLogoText || 'FLIVIO'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 -mr-2 text-[#1E2022] hover:text-[#1B2A4A] active:scale-90 transition-transform"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-5 py-3 space-y-0.5">
                  {NAV_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      onTouchStart={() => prefetchRoute(item.to)}
                      className={({ isActive }) =>
                        `flex items-center justify-between py-3 text-sm font-medium border-b border-[#ECE9E2] transition-colors ${
                          isActive ? 'text-[#1B2A4A] font-semibold' : 'text-[#1E2022]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span>{item.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 bg-[#1B2A4A]" />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>

                {womenCategories.length > 0 && (
                  <div className="px-5 pt-3 pb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1B2A4A] mb-2.5">
                      Women&apos;s Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {womenCategories.map((cat) => (
                        <NavLink
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `py-2 px-2.5 text-xs font-medium border truncate transition-colors ${
                              isActive
                                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                                : 'bg-[#F7F6F2] border-[#ECE9E2] text-[#1E2022] hover:border-[#1B2A4A]'
                            }`
                          }
                        >
                          {cat.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {menCategories.length > 0 && (
                  <div className="px-5 pt-1 pb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E64] mb-2.5">
                      Men&apos;s &amp; Essentials
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {menCategories.map((cat) => (
                        <NavLink
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `py-2 px-2.5 text-xs font-medium border truncate transition-colors ${
                              isActive
                                ? 'bg-[#1E2022] text-white border-[#1E2022]'
                                : 'bg-[#F7F6F2] border-[#ECE9E2] text-[#1E2022] hover:border-[#1B2A4A]'
                            }`
                          }
                        >
                          {cat.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-[#ECE9E2] space-y-2.5 bg-[#F7F6F2]">
                <Link
                  to={currentCustomer ? '/account' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-medium text-[#1E2022]"
                >
                  <span>
                    {currentCustomer ? `Account · ${currentCustomer.name}` : 'Sign In / Register'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-medium text-[#1E2022]"
                >
                  <span>Wishlist ({wishlistCount})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-medium text-[#5C5E64]"
                >
                  <span>Store Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Animated Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-start justify-center pt-12 sm:pt-20 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSearchOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.985 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-[#ECE9E2] w-full max-w-2xl shadow-2xl will-change-transform"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center border-b border-[#ECE9E2] px-4 py-3.5 gap-3"
              >
                <Search className="w-4 h-4 text-[#5C5E64] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search embroidered tops, Korean puff tops, floral blouses, short kurtis..."
                  className="flex-1 text-base sm:text-sm text-[#1E2022] placeholder:text-[#86888E] outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#5C5E64] hover:text-[#1E2022]"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="p-1 text-[#5C5E64] hover:text-[#1E2022]"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              <div className="p-4 max-h-[65vh] overflow-y-auto">
                {!q ? (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#5C5E64] mb-2.5">
                      Popular Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="px-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#ECE9E2] text-[#1E2022] hover:border-[#1B2A4A] transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#5C5E64]">
                      No products matched &quot;{searchQuery}&quot;.
                    </p>
                    <Link
                      to="/women"
                      onClick={() => setSearchOpen(false)}
                      className="mt-3 inline-block text-xs font-semibold text-[#1B2A4A] underline"
                    >
                      Browse Women&apos;s Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#5C5E64]">
                      <span>Matching Products</span>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-[#1B2A4A] font-medium hover:underline"
                      >
                        View all results
                      </button>
                    </div>
                    <div className="divide-y divide-[#ECE9E2]">
                      {searchResults.map((prod) => {
                        const img =
                          prod.images.find((i) => i.isMain)?.url || prod.images[0]?.url;
                        return (
                          <Link
                            key={prod.id}
                            to={`/product/${prod.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="py-2.5 flex items-center gap-3 hover:bg-[#F7F6F2] transition-colors px-1"
                          >
                            <div className="w-12 aspect-[4/5] bg-[#F7F6F2] shrink-0 overflow-hidden">
                              <ResolvedImage
                                src={img}
                                alt={prod.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] uppercase tracking-wider text-[#5C5E64]">
                                {prod.categoryName}
                              </p>
                              <p className="text-sm font-medium text-[#1E2022] truncate">
                                {prod.name}
                              </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-[#1E2022] shrink-0">
                              {formatINR(prod.sellingPrice)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
