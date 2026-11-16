import React from 'react';
import { useStore } from '../../store/useStore';
import { formatDate, formatINR } from '../../utils/format';

export const AdminCustomersPage: React.FC = () => {
  const { customers, orders } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Customers</h1>
        <p className="text-xs text-[#5C5E64]">
          Registered customer accounts and associated order summaries.
        </p>
      </div>

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Mobile</th>
              <th className="py-3 px-4 font-semibold">Saved Addresses</th>
              <th className="py-3 px-4 font-semibold">Orders</th>
              <th className="py-3 px-4 font-semibold text-right">Total Spend</th>
              <th className="py-3 px-4 font-semibold text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE9E2]">
            {customers.map((c) => {
              const custOrders = orders.filter(
                (o) =>
                  o.customer.customerId === c.id ||
                  o.customer.email?.toLowerCase() === c.email.toLowerCase()
              );
              const spend = custOrders
                .filter((o) => o.status !== 'Cancelled')
                .reduce((s, o) => s + o.totalAmount, 0);

              return (
                <tr key={c.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 font-medium text-[#1E2022]">{c.name}</td>
                  <td className="py-3 px-4 text-[#5C5E64]">{c.email}</td>
                  <td className="py-3 px-4 font-mono text-[#5C5E64]">{c.mobile}</td>
                  <td className="py-3 px-4 tabular-nums">{c.addresses.length}</td>
                  <td className="py-3 px-4 tabular-nums">{custOrders.length}</td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">
                    {formatINR(spend)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#5C5E64] tabular-nums">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
