import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { adminService } from '../../services/adminService';
import { formatDate, formatINR } from '../../utils/format';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, categories } = useStore();
  const metrics = adminService.getDashboardMetrics();

  const kpis = [
    { label: 'Total Products', value: metrics.totalProducts, sub: `${metrics.activeProducts} active` },
    { label: 'Total Variants', value: metrics.totalVariants, sub: 'Child SKUs' },
    { label: 'Total Orders', value: metrics.totalOrders, sub: 'All time' },
    { label: 'Pending Orders', value: metrics.pendingOrdersCount, sub: 'Needs action', accent: true },
    { label: 'Completed Orders', value: metrics.completedOrdersCount, sub: 'Delivered' },
    { label: 'Total Customers', value: metrics.totalCustomers, sub: 'Registered' },
    { label: 'Low Stock Variants', value: metrics.lowStockCount, sub: '≤ 5 units left', warn: metrics.lowStockCount > 0 },
    { label: 'Total Order Value', value: formatINR(metrics.totalOrderValue), sub: 'Excl. cancelled' },
  ];

  // Category revenue / product distribution
  const categoryStats = categories.map((cat) => {
    const prodIds = new Set(products.filter((p) => p.categoryId === cat.id).map((p) => p.id));
    const count = prodIds.size;
    const stock = products
      .filter((p) => p.categoryId === cat.id)
      .flatMap((p) => p.variants)
      .reduce((s, v) => s + v.stock, 0);
    return { name: cat.name, count, stock };
  });
  const maxStock = Math.max(1, ...categoryStats.map((c) => c.stock));

  // Order status breakdown
  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
  const statusCounts = statuses.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
            Store Overview
          </h1>
          <p className="mt-1 text-xs text-[#5C5E64]">
            Live catalog, inventory, and WhatsApp order metrics from local storage.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#E5E1D8] p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E64]">
              {k.label}
            </p>
            <p
              className={`mt-2 text-2xl sm:text-3xl font-semibold tabular-nums ${
                k.warn ? 'text-red-700' : k.accent ? 'text-[#1B2A4A]' : 'text-[#1E2022]'
              }`}
            >
              {k.value}
            </p>
            <p className="mt-1 text-xs text-[#86888E]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E1D8] p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-4">
            Inventory Units by Category
          </h2>
          <div className="space-y-3">
            {categoryStats.map((c) => {
              const pct = Math.round((c.stock / maxStock) * 100);
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1E2022]">
                      {c.name} <span className="text-[#86888E]">({c.count} products)</span>
                    </span>
                    <span className="font-mono tabular-nums text-[#5C5E64]">{c.stock} units</span>
                  </div>
                  <div className="h-2.5 bg-[#ECE9E2] w-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B2A4A] transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E1D8] p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-4">
            Order Status Breakdown
          </h2>
          <div className="divide-y divide-[#ECE9E2]">
            {statusCounts.map((s) => (
              <div key={s.status} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-[#1E2022] font-medium">{s.status}</span>
                <span className="font-mono tabular-nums font-semibold text-[#1E2022]">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E1D8] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-[#1B2A4A] hover:underline inline-flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-[#5C5E64] py-6">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5E1D8] text-[#5C5E64]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Order ID</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE9E2]">
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="hover:bg-[#F7F6F2]">
                      <td className="py-2.5 pr-3 font-mono font-semibold text-[#1E2022]">
                        {o.id}
                      </td>
                      <td className="py-2.5 pr-3 text-[#1E2022]">{o.customer.fullName}</td>
                      <td className="py-2.5 pr-3 text-[#5C5E64] tabular-nums">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-[#1B2A4A]">{o.status}</td>
                      <td className="py-2.5 font-semibold tabular-nums text-right text-[#1E2022]">
                        {formatINR(o.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E1D8] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#1B2A4A]" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link
              to="/admin/inventory"
              className="text-xs font-medium text-[#1B2A4A] hover:underline"
            >
              Manage Stock
            </Link>
          </div>
          {metrics.lowStockVariants.length === 0 ? (
            <p className="text-xs text-[#5C5E64] py-6">All variants are well stocked.</p>
          ) : (
            <div className="divide-y divide-[#ECE9E2]">
              {metrics.lowStockVariants.slice(0, 6).map((v) => {
                const parent = products.find((p) => p.id === v.productId);
                return (
                  <div key={v.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-[#1E2022] truncate">
                        {parent?.name || 'Product'}
                      </p>
                      <p className="text-[#5C5E64] font-mono text-[11px]">
                        {v.variantName} · {v.sku}
                      </p>
                    </div>
                    <span
                      className={`tabular-nums font-semibold shrink-0 ${
                        v.stock === 0 ? 'text-red-700' : 'text-[#1B2A4A]'
                      }`}
                    >
                      {v.stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
