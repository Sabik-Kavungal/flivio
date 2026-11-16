import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { settingsService } from '../../services/settingsService';
import { sanitizeWhatsappNumber } from '../../utils/format';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshAll, pushToast } = useStore();
  const [form, setForm] = useState({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWa = sanitizeWhatsappNumber(form.whatsappNumber);
    if (cleanedWa.length < 10) {
      pushToast({
        title: 'Invalid WhatsApp Number',
        description: 'Enter country code + number without spaces (e.g. 919744296860).',
        type: 'error',
      });
      return;
    }
    settingsService.updateSettings({
      ...form,
      whatsappNumber: cleanedWa,
    });
    setForm((prev) => ({ ...prev, whatsappNumber: cleanedWa }));
    refreshAll();
    pushToast({ title: 'Store settings saved', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">
          Store Settings
        </h1>
        <p className="text-xs text-[#5C5E64]">
          Configure WhatsApp order destination number, store identity, contact channels, and policies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            Brand &amp; WhatsApp Order Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Store Name</label>
              <input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Header Logo Text</label>
              <input
                value={form.storeLogoText}
                onChange={(e) => setForm({ ...form, storeLogoText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                WhatsApp Order Number (International, digits only)
              </label>
              <input
                required
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="919744296860"
                className="w-full px-3 py-2 text-sm font-mono border border-[#E5E1D8]"
              />
              <p className="mt-1 text-[11px] text-[#5C5E64]">
                Used in <span className="font-mono">https://wa.me/{sanitizeWhatsappNumber(form.whatsappNumber || '919744296860')}</span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Currency</label>
              <input
                disabled
                value="INR (₹)"
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8] bg-[#F7F6F2] text-[#5C5E64]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Contact Phone</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Instagram URL</label>
              <input
                type="url"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            Editable Legal &amp; Information Pages
          </h2>
          <div>
            <label className="block text-xs font-medium mb-1">About Us Content</label>
            <textarea
              rows={3}
              value={form.aboutContent}
              onChange={(e) => setForm({ ...form, aboutContent: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Shipping Policy</label>
            <textarea
              rows={3}
              value={form.shippingPolicy}
              onChange={(e) => setForm({ ...form, shippingPolicy: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Return &amp; Refund Policy</label>
            <textarea
              rows={3}
              value={form.returnPolicy}
              onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Privacy Policy</label>
            <textarea
              rows={3}
              value={form.privacyPolicy}
              onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Terms &amp; Conditions</label>
            <textarea
              rows={3}
              value={form.termsAndConditions}
              onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
};
