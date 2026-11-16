import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { productService } from '../../services/productService';

export const AdminInventoryPage: React.FC = () => {
  const { products, refreshAll, pushToast } = useStore();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({ product: p, variant: v }))
  );

  const filtered = rows.filter(({ variant }) => {
    if (filter === 'low') return variant.stock > 0 && variant.stock <= 5;
    if (filter === 'out') return variant.stock === 0;
    return true;
  });

  const adjust = (productId: string, variantId: string, currentStock: number, delta: number) => {
    const next = Math.max(0, currentStock + delta);
    productService.updateVariant(productId, variantId, { stock: next });
    refreshAll();
    pushToast({ title: 'Inventory updated', type: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Inventory</h1>
          <p className="text-xs text-[#5C5E64]">
            Track stock quantities per child variant. Stock automatically deducts when orders are placed.
          </p>
        </div>

        <div className="flex border border-[#E5E1D8] bg-white">
          {[
            { id: 'all', label: `All (${rows.length})` },
            { id: 'low', label: `Low Stock (${rows.filter((r) => r.variant.stock > 0 && r.variant.stock <= 5).length})` },
            { id: 'out', label: `Out of Stock (${rows.filter((r) => r.variant.stock === 0).length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id as typeof filter)}
              className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                filter === t.id
                  ? 'bg-[#1E2022] text-white'
                  : 'text-[#5C5E64] hover:text-[#1E2022]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">SKU</th>
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold">Variant</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE9E2]">
            {filtered.map(({ product, variant }) => (
              <tr key={variant.id} className="hover:bg-[#F7F6F2]">
                <td className="py-3 px-4 font-mono text-[11px] text-[#5C5E64]">
                  {variant.sku}
                </td>
                <td className="py-3 px-4 font-medium text-[#1E2022]">{product.name}</td>
                <td className="py-3 px-4 text-[#5C5E64]">{variant.variantName}</td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold ${
                      variant.stock === 0
                        ? 'text-red-700'
                        : variant.stock <= 5
                        ? 'text-[#1B2A4A]'
                        : 'text-emerald-700'
                    }`}
                  >
                    {variant.stock === 0
                      ? 'Out of Stock'
                      : variant.stock <= 5
                      ? 'Low Stock'
                      : 'Healthy'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjust(product.id, variant.id, variant.stock, -1)}
                      className="w-7 h-7 border border-[#E5E1D8] flex items-center justify-center hover:bg-[#F7F6F2]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-9 text-center font-mono font-semibold tabular-nums">
                      {variant.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjust(product.id, variant.id, variant.stock, 1)}
                      className="w-7 h-7 border border-[#E5E1D8] flex items-center justify-center hover:bg-[#F7F6F2]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjust(product.id, variant.id, variant.stock, 10)}
                      className="px-2 py-1 border border-[#E5E1D8] text-[11px] hover:border-[#1B2A4A]"
                    >
                      +10
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
