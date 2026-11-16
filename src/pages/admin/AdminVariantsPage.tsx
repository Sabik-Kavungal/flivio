import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { productService } from '../../services/productService';

export const AdminVariantsPage: React.FC = () => {
  const { products, refreshAll, pushToast } = useStore();
  const [search, setSearch] = useState('');

  const allRows = products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
    }))
  );

  const filtered = allRows.filter(({ product, variant }) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      variant.variantName.toLowerCase().includes(q) ||
      variant.sku.toLowerCase().includes(q)
    );
  });

  const handleFieldUpdate = (
    productId: string,
    variantId: string,
    updates: { sellingPrice?: number; originalPrice?: number; stock?: number; isActive?: boolean }
  ) => {
    productService.updateVariant(productId, variantId, updates);
    refreshAll();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">
          Child Variants Matrix
        </h1>
        <p className="text-xs text-[#5C5E64]">
          Quickly inspect and adjust prices, stock, and availability across all child SKUs.
        </p>
      </div>

      <div className="bg-white border border-[#E5E1D8] p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#86888E]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by parent product, colour, size, or SKU..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F2] border-b border-[#E5E1D8] text-[#5C5E64] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Parent Product</th>
              <th className="py-3 px-4 font-semibold">Variant</th>
              <th className="py-3 px-4 font-semibold">SKU</th>
              <th className="py-3 px-4 font-semibold">Selling Price (₹)</th>
              <th className="py-3 px-4 font-semibold">Stock</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE9E2]">
            {filtered.map(({ product, variant }) => (
              <tr key={variant.id} className="hover:bg-[#F7F6F2]">
                <td className="py-3 px-4 font-medium text-[#1E2022] max-w-[200px] truncate">
                  {product.name}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-black/15 shrink-0"
                      style={{ backgroundColor: variant.colourHex }}
                    />
                    <span>{variant.variantName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-[#5C5E64]">
                  {variant.sku}
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min={0}
                    defaultValue={variant.sellingPrice}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== variant.sellingPrice) {
                        handleFieldUpdate(product.id, variant.id, { sellingPrice: val });
                        pushToast({ title: `Updated price for ${variant.sku}`, type: 'success' });
                      }
                    }}
                    className="w-24 px-2 py-1 border border-[#E5E1D8] tabular-nums bg-white"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min={0}
                    defaultValue={variant.stock}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== variant.stock) {
                        handleFieldUpdate(product.id, variant.id, { stock: val });
                        pushToast({ title: `Updated stock for ${variant.sku}`, type: 'success' });
                      }
                    }}
                    className="w-20 px-2 py-1 border border-[#E5E1D8] tabular-nums bg-white"
                  />
                </td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => {
                      handleFieldUpdate(product.id, variant.id, { isActive: !variant.isActive });
                      pushToast({ title: 'Variant status updated', type: 'info' });
                    }}
                    className={`font-semibold ${
                      variant.isActive ? 'text-emerald-700' : 'text-[#86888E]'
                    }`}
                  >
                    {variant.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
