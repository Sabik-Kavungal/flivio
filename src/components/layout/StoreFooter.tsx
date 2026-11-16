import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { sanitizeWhatsappNumber } from '../../utils/format';

export const StoreFooter: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const footerTagline = useStore((s) => s.siteContent.footerTagline);
  const waPhone = sanitizeWhatsappNumber(settings.whatsappNumber || '919744296860');

  return (
    <footer className="bg-[#F7F6F2] border-t border-[#ECE9E2] text-[#1E2022]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-7 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-12 lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="font-display text-2xl font-bold tracking-[0.14em] text-[#1E2022] inline-block"
            >
              {settings.storeName || 'FLIVIO'}
            </Link>
            <p className="text-sm text-[#5C5E64] leading-relaxed max-w-sm">
              {footerTagline}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-[#ECE9E2] bg-white hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-[#ECE9E2] bg-white hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Women's Fashion Links */}
          <div className="col-span-1 md:col-span-5 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Shop Women&apos;s
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5C5E64]">
              <li><Link to="/women" className="hover:text-[#1B2A4A] transition-colors">All Tops &amp; Kurtis</Link></li>
              <li><Link to="/category/embroidered-sleeveless-layered-tops" className="hover:text-[#1B2A4A] transition-colors">Embroidered Sleeveless Layered Tops</Link></li>
              <li><Link to="/category/korean-style-tops" className="hover:text-[#1B2A4A] transition-colors">Korean-Style Tops</Link></li>
              <li><Link to="/category/floral-printed-tops" className="hover:text-[#1B2A4A] transition-colors">Floral Printed Tops</Link></li>
              <li><Link to="/category/short-kurtis" className="hover:text-[#1B2A4A] transition-colors">Short Kurtis</Link></li>
            </ul>
          </div>

          {/* Explore & Account */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5C5E64]">
              <li><Link to="/new-arrivals" className="hover:text-[#1B2A4A] transition-colors">New Arrivals</Link></li>
              <li><Link to="/best-sellers" className="hover:text-[#1B2A4A] transition-colors">Best Sellers</Link></li>
              <li><Link to="/collections" className="hover:text-[#1B2A4A] transition-colors">Featured Edit</Link></li>
              <li><Link to="/offers" className="hover:text-[#1B2A4A] transition-colors">Seasonal Offers</Link></li>
              <li><Link to="/account" className="hover:text-[#1B2A4A] transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#1B2A4A] transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
              Policies &amp; Care
            </h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 text-xs sm:text-sm text-[#5C5E64]">
              <li><Link to="/about" className="hover:text-[#1B2A4A] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#1B2A4A] transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-[#1B2A4A] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-refund-policy" className="hover:text-[#1B2A4A] transition-colors">Return &amp; Refund</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#1B2A4A] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/admin" className="text-xs text-[#86888E] hover:text-[#1E2022] transition-colors">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-[#ECE9E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[#5C5E64]">
          <p>© {new Date().getFullYear()} {settings.storeName || 'FLIVIO'} · flivio.store. All rights reserved.</p>
          <p className="break-words">Support: {settings.contactEmail} · {settings.contactPhone}</p>
        </div>
      </div>
    </footer>
  );
};
