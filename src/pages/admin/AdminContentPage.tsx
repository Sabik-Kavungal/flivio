import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { settingsService } from '../../services/settingsService';
import { saveImageToDb } from '../../db/imageDb';
import { ResolvedImage } from '../../components/common/ResolvedImage';

export const AdminContentPage: React.FC = () => {
  const { siteContent, refreshAll, pushToast } = useStore();
  const [form, setForm] = useState({ ...siteContent });

  const handleImageUpload = async (
    field: 'heroImage' | 'promoImage' | 'featuredImage' | 'specialBannerImage',
    files: FileList | null
  ) => {
    if (!files || !files[0]) return;
    try {
      const key = await saveImageToDb(files[0]);
      setForm((prev) => ({ ...prev, [field]: key }));
      pushToast({ title: 'Banner image uploaded', type: 'success' });
    } catch (err) {
      pushToast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Invalid file',
        type: 'error',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.updateSiteContent(form);
    refreshAll();
    pushToast({ title: 'Website content updated', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">
          Website Content
        </h1>
        <p className="text-xs text-[#5C5E64]">
          Customize homepage hero copy, editorial banners, Instagram showcase, and footer messaging.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            Homepage Hero Section
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Hero Small Label</label>
                <input
                  value={form.heroLabel}
                  onChange={(e) => setForm({ ...form, heroLabel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hero Heading</label>
                <input
                  value={form.heroHeading}
                  onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hero Description</label>
                <textarea
                  rows={2}
                  value={form.heroSubheading}
                  onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
                />
              </div>
            </div>
            <div className="md:col-span-4 space-y-2">
              <div className="aspect-[3/4] max-h-48 border border-[#E5E1D8] bg-[#F7F6F2] overflow-hidden">
                <ResolvedImage src={form.heroImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E1D8] bg-[#F7F6F2] text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Hero Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('heroImage', e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Promo & Featured */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Promotional Banner
            </h2>
            <input
              value={form.promoHeading}
              onChange={(e) => setForm({ ...form, promoHeading: e.target.value })}
              placeholder="Promo Heading"
              className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
            />
            <textarea
              rows={2}
              value={form.promoSubheading}
              onChange={(e) => setForm({ ...form, promoSubheading: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
            />
            <div className="aspect-video border border-[#E5E1D8] overflow-hidden">
              <ResolvedImage src={form.promoImage} alt="Promo" className="w-full h-full object-cover" />
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E1D8] bg-[#F7F6F2] text-xs font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Promo Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('promoImage', e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-white border border-[#E5E1D8] p-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Special Collection Banner
            </h2>
            <input
              value={form.specialBannerLabel || ''}
              onChange={(e) => setForm({ ...form, specialBannerLabel: e.target.value })}
              placeholder="Special Banner Label"
              className="w-full px-3 py-2 text-xs border border-[#E5E1D8]"
            />
            <input
              value={form.specialBannerHeading || form.featuredHeading}
              onChange={(e) =>
                setForm({
                  ...form,
                  specialBannerHeading: e.target.value,
                  featuredHeading: e.target.value,
                })
              }
              placeholder="Special Banner Heading"
              className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
            />
            <textarea
              rows={2}
              value={form.specialBannerSubheading || form.featuredSubheading}
              onChange={(e) =>
                setForm({
                  ...form,
                  specialBannerSubheading: e.target.value,
                  featuredSubheading: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
            />
            <div className="aspect-video border border-[#E5E1D8] overflow-hidden bg-[#F7F6F2]">
              <ResolvedImage
                src={form.specialBannerImage || form.featuredImage}
                alt="Special Collection Banner"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E1D8] bg-[#F7F6F2] text-xs font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Special Banner Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('specialBannerImage', e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Instagram & Footer */}
        <div className="bg-white border border-[#E5E1D8] p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
            Instagram &amp; Footer Copy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Instagram Section Heading</label>
              <input
                value={form.instagramHeading}
                onChange={(e) => setForm({ ...form, instagramHeading: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Instagram Handle</label>
              <input
                value={form.instagramHandle}
                onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Footer Brand Tagline</label>
              <input
                value={form.footerTagline}
                onChange={(e) => setForm({ ...form, footerTagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#E5E1D8]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save Website Content</span>
        </button>
      </form>
    </div>
  );
};
