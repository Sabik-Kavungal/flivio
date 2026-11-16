import React, { useState } from 'react';
import { Search, Eye, X, MessageCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { ResolvedImage } from '../../components/common/ResolvedImage';
import { formatDateTime, formatINR } from '../../utils/format';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const AdminOrdersPage: React.FC = () => {
  const { orders, refreshAll, pushToast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (dateFilter && !o.createdAt.startsWith(dateFilter)) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobile.toLowerCase().includes(q) ||
        o.customer.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    const updated = orderService.updateStatus(orderId, nextStatus);
    refreshAll();
    if (selectedOrder?.id === orderId && updated) {
      setSelectedOrder(updated);
    }
    pushToast({ title: `Order ${orderId} marked ${nextStatus}`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Orders</h1>
        <p className="text-xs text-[#5C5E64]">
          View customer WhatsApp orders, verify ordered variants, and update fulfillment statuses.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E1D8] p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 flex items-center gap-2 border border-[#E5E1D8] px-3 py-2">
          <Search className="w-4 h-4 text-[#86888E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, mobile, city..."
            className="flex-1 text-xs outline-none bg-transparent"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#E5E1D8] bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3 flex gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-[#E5E1D8] bg-white"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="px-2.5 text-xs border border-[#E5E1D8]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#5C5E64]">
            No orders match the current filters.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE9E2]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 font-mono font-semibold text-[#1E2022]">
                    {order.id}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1E2022]">{order.customer.fullName}</p>
                    <p className="text-[11px] text-[#5C5E64]">{order.customer.mobile}</p>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-[#5C5E64]">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </td>
                  <td className="py-3 px-4 font-semibold tabular-nums text-[#1E2022]">
                    {formatINR(order.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="px-2.5 py-1 text-xs border border-[#E5E1D8] bg-white font-medium text-[#1E2022]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-[#5C5E64]">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E5E1D8] hover:border-[#1E2022] text-xs font-medium text-[#1E2022]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E1D8] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E1D8] pb-4">
              <div>
                <h2 className="font-mono text-xl font-semibold text-[#1E2022]">
                  {selectedOrder.id}
                </h2>
                <p className="text-xs text-[#5C5E64] mt-0.5 tabular-nums">
                  Placed {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#5C5E64]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F7F6F2] border border-[#E5E1D8] p-4">
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#1E2022] mb-1">
                  Customer Info
                </p>
                <p className="font-medium text-sm text-[#1E2022]">
                  {selectedOrder.customer.fullName}
                </p>
                <p className="text-[#5C5E64]">Mobile: {selectedOrder.customer.mobile}</p>
                <p className="text-[#5C5E64]">WhatsApp: {selectedOrder.customer.whatsappNumber}</p>
                {selectedOrder.customer.email && (
                  <p className="text-[#5C5E64]">Email: {selectedOrder.customer.email}</p>
                )}
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#1E2022] mb-1">
                  Delivery Address
                </p>
                <p className="text-[#5C5E64] leading-relaxed">
                  {selectedOrder.customer.house}, {selectedOrder.customer.street},{' '}
                  {selectedOrder.customer.city}, {selectedOrder.customer.district},{' '}
                  {selectedOrder.customer.state} - {selectedOrder.customer.pinCode}
                </p>
                {selectedOrder.customer.deliveryInstructions && (
                  <p className="mt-1 text-[#1B2A4A]">
                    Note: {selectedOrder.customer.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-2.5">
                Ordered Items
              </p>
              <div className="divide-y divide-[#E5E1D8] border border-[#E5E1D8]">
                {selectedOrder.items.map((item) => (
                  <div
                    key={`${item.productId}_${item.variantId}`}
                    className="p-3 flex items-center gap-3"
                  >
                    <div className="w-12 h-15 bg-[#F7F6F2] shrink-0 overflow-hidden">
                      <ResolvedImage
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1E2022]">{item.productName}</p>
                      <p className="text-[11px] text-[#5C5E64]">
                        {item.colour} · Size {item.size} · Qty {item.quantity} ·{' '}
                        <span className="font-mono">{item.sku}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      {formatINR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 text-xs border border-[#E5E1D8] bg-white font-semibold"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${selectedOrder.customer.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message Customer</span>
                </a>
                <span className="text-base font-semibold tabular-nums">
                  {formatINR(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
