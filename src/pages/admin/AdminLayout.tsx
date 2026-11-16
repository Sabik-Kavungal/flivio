import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useStore } from '../../store/useStore';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Variants', to: '/admin/variants', icon: Layers },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Promotions', to: '/admin/promotions', icon: Tag },
  { label: 'Website Content', to: '/admin/content', icon: FileText },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { adminSession, setAdminSession, pushToast } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!adminSession) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    adminService.logout();
    setAdminSession(null);
    pushToast({ title: 'Signed out from Admin', type: 'info' });
    navigate('/admin/login');
  };

  const currentNav =
    ADMIN_NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))) ||
    ADMIN_NAV[0];

  const SidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-[#E5E1D8]">
      <div>
        <div className="h-16 px-5 border-b border-[#E5E1D8] flex items-center justify-between">
          <div>
            <span className="font-display text-lg font-bold tracking-[0.14em] text-[#1E2022]">
              FLIVIO
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-[#1B2A4A]">
              Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#5C5E64]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F7F6F2] text-[#1B2A4A] font-semibold border border-[#E5E1D8]'
                    : 'text-[#5C5E64] hover:text-[#1E2022] hover:bg-[#F7F6F2] border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-[#E5E1D8] space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#5C5E64] hover:text-[#1E2022] hover:bg-[#F7F6F2]"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>View Storefront</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 h-full bg-white">{SidebarContent}</aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 -ml-2 text-[#1E2022]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#5C5E64] truncate">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-[#1E2022]">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-[#5C5E64]">
              {adminSession.email}
            </span>
            <Link
              to="/"
              className="px-3 py-1.5 border border-[#E5E1D8] hover:border-[#1E2022] text-xs font-medium text-[#1E2022] whitespace-nowrap"
            >
              Storefront
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
