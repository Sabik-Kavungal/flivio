import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { settingsService } from '../../services/settingsService';

export const AdminPromotionsPage: React.FC = () => {
  const { promotions, refreshAll, pushToast } = useStore();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [code, setCode] = useState('');
  const [discountLabel, setDiscountLabel] = useState('');
  const [targetUrl, setTargetUrl] = useState('/offers');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.createPromotion({
      title,
      subtitle,
      code: code.toUpperCase(),
      discountLabel,
      targetUrl,
      isActive: true,
    });
    setTitle('');
    setSubtitle('');
    setCode('');
    setDiscountLabel('');
    refreshAll();
    pushToast({ title: 'Promotion created', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Promotions</h1>
        <p className="text-xs text-[#5C5E64]">
          Manage active seasonal offers and promotional campaign codes.
        </p>
      </div>

      <form onSubmit={handleCreate} className="bg-white border border-[#E5E1D8] p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
          Add New Promotion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Campaign Title"
            className="px-3 py-2 text-xs border border-[#E5E1D8]"
          />
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Promo Code (e.g. FLIVIO20)"
            className="px-3 py-2 text-xs font-mono border border-[#E5E1D8]"
          />
          <input
            required
            value={discountLabel}
            onChange={(e) => setDiscountLabel(e.target.value)}
            placeholder="Label (e.g. 20% Off)"
            className="px-3 py-2 text-xs border border-[#E5E1D8]"
          />
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="/offers"
            className="px-3 py-2 text-xs border border-[#E5E1D8]"
          />
          <input
            required
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Short campaign description"
            className="sm:col-span-2 lg:col-span-4 px-3 py-2 text-xs border border-[#E5E1D8]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Promotion</span>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-white border border-[#E5E1D8] p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#1B2A4A]">
                  {promo.code} · {promo.discountLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    settingsService.updatePromotion(promo.id, { isActive: !promo.isActive });
                    refreshAll();
                  }}
                  className={`text-xs font-semibold ${
                    promo.isActive ? 'text-emerald-700' : 'text-[#86888E]'
                  }`}
                >
                  {promo.isActive ? 'Active' : 'Paused'}
                </button>
              </div>
              <h3 className="mt-2 text-base font-medium text-[#1E2022]">{promo.title}</h3>
              <p className="mt-1 text-xs text-[#5C5E64]">{promo.subtitle}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#ECE9E2] text-xs">
              <span className="text-[#86888E]">Link: {promo.targetUrl}</span>
              <button
                type="button"
                onClick={() => {
                  settingsService.deletePromotion(promo.id);
                  refreshAll();
                  pushToast({ title: 'Promotion removed', type: 'info' });
                }}
                className="text-red-600 inline-flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
