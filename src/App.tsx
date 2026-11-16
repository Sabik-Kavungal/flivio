import React, { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { MotionConfig, motion } from 'motion/react';
import { StoreHeader } from './components/layout/StoreHeader';
import { StoreFooter } from './components/layout/StoreFooter';
import { CartDrawer } from './components/layout/CartDrawer';
import { QuickViewModal } from './components/product/QuickViewModal';
import { ToastContainer } from './components/common/ToastContainer';
import { BackToTop } from './components/common/BackToTop';
import { scheduleIdlePrefetch } from './utils/routePrefetch';

// Eager load HomePage for instant 0ms initial LCP
import { HomePage } from './pages/HomePage';

// Lazy-load secondary storefront routes & entire Admin Console so initial JS stays lightweight
const ShopPage = lazy(() =>
  import('./pages/ShopPage').then((m) => ({ default: m.ShopPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((m) => ({
    default: m.OrderConfirmationPage,
  }))
);
const LoginPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.ForgotPasswordPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const CustomerOrderDetailPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.CustomerOrderDetailPage }))
);
const ContactPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.ContactPage }))
);
const PolicyPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.PolicyPage }))
);

// Lazy-load Admin Console separately from shopper bundle
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({
    default: m.AdminProductsPage,
  }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({
    default: m.AdminCategoriesPage,
  }))
);
const AdminVariantsPage = lazy(() =>
  import('./pages/admin/AdminVariantsPage').then((m) => ({
    default: m.AdminVariantsPage,
  }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({
    default: m.AdminOrdersPage,
  }))
);
const AdminInventoryPage = lazy(() =>
  import('./pages/admin/AdminInventoryPage').then((m) => ({
    default: m.AdminInventoryPage,
  }))
);
const AdminCustomersPage = lazy(() =>
  import('./pages/admin/AdminCustomersPage').then((m) => ({
    default: m.AdminCustomersPage,
  }))
);
const AdminPromotionsPage = lazy(() =>
  import('./pages/admin/AdminPromotionsPage').then((m) => ({
    default: m.AdminPromotionsPage,
  }))
);
const AdminContentPage = lazy(() =>
  import('./pages/admin/AdminContentPage').then((m) => ({
    default: m.AdminContentPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({
    default: m.AdminSettingsPage,
  }))
);

const ScrollManager: React.FC = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Scroll smoothly to top on forward navigation; preserve scroll when going Back/Forward (POP)
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, navType]);

  return null;
};

const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] bg-white">
    <div className="h-[2px] w-full bg-[#ECE9E2] overflow-hidden">
      <div className="h-full w-1/3 bg-[#1B2A4A] animate-pulse" />
    </div>
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
      <div className="h-8 w-48 skeleton-shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <div className="aspect-[4/5] skeleton-shimmer" />
            <div className="h-3 w-3/4 skeleton-shimmer" />
            <div className="h-3 w-1/3 skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StorefrontLayout: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen flex flex-col bg-white text-[#1E2022] overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:px-4 focus:py-2.5 focus:bg-[#1B2A4A] focus:text-white focus:text-xs focus:font-semibold focus:uppercase focus:tracking-wider focus:shadow-lg"
      >
        Skip to main content
      </a>
      <StoreHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageFallback />}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0.95, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <StoreFooter />
      <CartDrawer />
      <QuickViewModal />
      <BackToTop />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    scheduleIdlePrefetch();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          {/* Customer Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage mode="all" />} />
            <Route path="/women" element={<ShopPage mode="women" />} />
            <Route path="/men" element={<Navigate to="/women" replace />} />
            <Route path="/category/:slug" element={<ShopPage mode="category" />} />
            <Route path="/new-arrivals" element={<ShopPage mode="new-arrivals" />} />
            <Route path="/collections" element={<ShopPage mode="collections" />} />
            <Route path="/best-sellers" element={<ShopPage mode="best-sellers" />} />
            <Route path="/offers" element={<ShopPage mode="offers" />} />
            <Route path="/search" element={<ShopPage mode="search" />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

            {/* Auth & Customer Account */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/account" element={<AccountPage initialTab="profile" />} />
            <Route path="/account/orders" element={<AccountPage initialTab="orders" />} />
            <Route path="/account/orders/:orderId" element={<CustomerOrderDetailPage />} />

            {/* Legal & Brand Info */}
            <Route path="/about" element={<PolicyPage type="about" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shipping-policy" element={<PolicyPage type="shipping" />} />
            <Route path="/return-refund-policy" element={<PolicyPage type="returns" />} />
            <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
            <Route path="/terms-and-conditions" element={<PolicyPage type="terms" />} />
          </Route>

          {/* Admin Console (Code-Split Bundle) */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLoginPage />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="variants" element={<AdminVariantsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </MotionConfig>
  );
}
