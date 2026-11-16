import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Instagram,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Tag,
  Headphones,
  Star,
  Copy,
  Check,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { ProductCard } from '../components/product/ProductCard';
import { IMAGES } from '../data/seed';

const SHOWCASE_CATEGORIES = [
  {
    title: 'Embroidered Sleeveless Layered Tops',
    slug: 'embroidered-sleeveless-layered-tops',
    subtitle: 'White eyelet & pastel layered hems · ₹399–₹499',
    fallbackImage: IMAGES.whiteEyeletLayered,
  },
  {
    title: 'Korean-Style Tops',
    slug: 'korean-style-tops',
    subtitle: 'Pastel puff sleeves, bows & Seoul fits · ₹449–₹599',
    fallbackImage: IMAGES.koreanPinkPuff,
  },
  {
    title: 'Floral Printed Tops',
    slug: 'floral-printed-tops',
    subtitle: 'Lace-trim bishop & airy floral tops · ₹399–₹499',
    fallbackImage: IMAGES.creamBlueFloral,
  },
  {
    title: 'Short Kurtis',
    slug: 'short-kurtis',
    subtitle: 'Breathable cotton printed short kurtis · ₹399–₹499',
    fallbackImage: IMAGES.kurtiBeigeFloral,
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const HomePage: React.FC = () => {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const siteContent = useStore((s) => s.siteContent);
  const settings = useStore((s) => s.settings);
  const promotions = useStore((s) => s.promotions);
  const pushToast = useStore((s) => s.pushToast);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('flivio_newsletter_v1'));
    } catch {
      return false;
    }
  });

  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);
  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);
  const activePromotions = useMemo(
    () => promotions.filter((p) => p.isActive).slice(0, 2),
    [promotions]
  );

  const sortWomenFirst = (list: typeof activeProducts) =>
    [...list].sort((a, b) => {
      const aW = a.audience === 'women' ? 0 : 1;
      const bW = b.audience === 'women' ? 0 : 1;
      if (aW !== bW) return aW - bW;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const newArrivals = useMemo(
    () => sortWomenFirst(activeProducts.filter((p) => p.isNewArrival)).slice(0, 8),
    [activeProducts]
  );

  const trendingItems = useMemo(
    () => sortWomenFirst(activeProducts.filter((p) => p.isTrending)).slice(0, 4),
    [activeProducts]
  );

  const bestSellers = useMemo(
    () => sortWomenFirst(activeProducts.filter((p) => p.isBestSeller)).slice(0, 8),
    [activeProducts]
  );

  const featuredProducts = useMemo(
    () => sortWomenFirst(activeProducts.filter((p) => p.isFeatured)).slice(0, 4),
    [activeProducts]
  );

  // Pull real product reviews from catalog
  const customerReviews = useMemo(
    () =>
      activeProducts
        .flatMap((p) =>
          (p.reviews || []).map((r) => ({
            ...r,
            productName: p.name,
            productSlug: p.slug,
            categoryName: p.categoryName,
          }))
        )
        .slice(0, 3),
    [activeProducts]
  );

  const shopYourStyleItems = siteContent.shopYourStyleItems || [];
  const specialLabel = siteContent.specialBannerLabel || siteContent.featuredLabel;
  const specialHeading =
    siteContent.specialBannerHeading || 'YOUR NEW FAVOURITE LOOK IS HERE.';
  const specialSubheading =
    siteContent.specialBannerSubheading ||
    'Fresh prints. Beautiful fits. Everyday confidence.';
  const specialImage =
    siteContent.specialBannerImage || siteContent.featuredImage;

  const secondaryDirectoryLinks = [
    { label: 'All Tops & Kurtis', to: '/women' },
    { label: 'New Arrivals', to: '/new-arrivals' },
    { label: 'Best Sellers', to: '/best-sellers' },
    { label: 'Featured Edit', to: '/collections' },
    { label: 'Seasonal Offers', to: '/offers' },
  ];

  const handleCopyPromo = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      pushToast({ title: `Code ${code} copied`, type: 'success' });
      setTimeout(() => setCopiedCode(null), 2200);
    } catch {
      pushToast({ title: `Use code ${code} on WhatsApp order`, type: 'info' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newsletterEmail.trim();
    if (!cleaned || !cleaned.includes('@')) {
      pushToast({ title: 'Enter a valid email address', type: 'error' });
      return;
    }
    try {
      localStorage.setItem('flivio_newsletter_v1', cleaned);
    } catch {
      // ignore storage quota
    }
    setSubscribed(true);
    setNewsletterEmail('');
    pushToast({
      title: 'Welcome to The FLIVIO Edit',
      description: 'You are on the list for new arrivals and seasonal offers.',
      type: 'success',
    });
  };

  return (
    <div className="bg-white text-[#1E2022]">
      {/* Section 1 — Hero Split Editorial (Fits visible viewport across mobile, tablet & laptop) */}
      <section className="border-b border-[#ECE9E2] bg-[#F7F6F2] overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 items-stretch md:h-[clamp(460px,70svh,560px)] lg:h-[clamp(520px,calc(100svh-65px),720px)]">
          {/* Editorial Copy */}
          <div className="md:col-span-6 lg:col-span-7 md:min-h-0 px-4 sm:px-7 md:px-8 lg:px-14 xl:px-16 py-7 sm:py-9 md:py-6 flex flex-col justify-center order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2.5">
                <span className="w-6 h-[1px] bg-[#1B2A4A]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B2A4A]">
                  {siteContent.heroLabel}
                </p>
              </div>

              <h1 className="mt-3 sm:mt-4 font-display text-[clamp(1.625rem,4.2vw,3.375rem)] font-semibold tracking-tight text-[#1E2022] leading-[1.08]">
                {siteContent.heroHeading}
              </h1>

              <p className="mt-3 sm:mt-4 lg:mt-5 text-sm sm:text-[15px] lg:text-[17px] text-[#5C5E64] leading-relaxed max-w-lg">
                {siteContent.heroSubheading}
              </p>

              <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <Link
                  to="/women"
                  className="px-4 sm:px-6 py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Explore Women&apos;s Collection</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
                <Link
                  to="/new-arrivals"
                  className="px-4 sm:px-6 py-3.5 border border-[#1E2022] text-[#1E2022] hover:bg-[#1B2A4A] hover:border-[#1B2A4A] hover:text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center transition-colors active:scale-[0.98] whitespace-nowrap"
                >
                  Shop New Arrivals
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Editorial Photography */}
          <motion.div
            initial={{ opacity: 0.85, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="md:col-span-6 lg:col-span-5 md:min-h-0 relative w-full aspect-[4/5] max-h-[440px] sm:max-h-[480px] md:max-h-none md:aspect-auto md:h-full bg-[#ECE9E2] overflow-hidden order-1 md:order-2"
          >
            <ResolvedImage
              src={siteContent.heroImage}
              alt={siteContent.heroHeading}
              priority
              className="w-full h-full md:absolute md:inset-0 object-cover object-[50%_15%]"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 2 — Shop by Category */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16"
      >
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
              Women&apos;s Edit
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/women"
            className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {SHOWCASE_CATEGORIES.map((item) => {
            const matchedCat = activeCategories.find((c) => c.slug === item.slug);
            const img = matchedCat?.image || item.fallbackImage;
            const count = matchedCat
              ? activeProducts.filter((p) => p.categoryId === matchedCat.id).length
              : 0;

            return (
              <Link
                key={item.slug}
                to={`/category/${item.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] bg-[#F7F6F2] overflow-hidden border border-[#ECE9E2]">
                  <ResolvedImage
                    src={img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="mt-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#1E2022] group-hover:text-[#1B2A4A] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {count > 0 && (
                      <span className="text-[11px] text-[#5C5E64] tabular-nums shrink-0 pt-0.5">
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5C5E64] mt-0.5 line-clamp-2 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Clean Hairline Directory Strip */}
        <div className="mt-7 sm:mt-8 pt-5 border-t border-[#ECE9E2] flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E64]">
            More Styles:
          </span>
          {secondaryDirectoryLinks.map((lnk) => (
            <Link
              key={lnk.to}
              to={lnk.to}
              className="text-xs font-medium text-[#1E2022] hover:text-[#1B2A4A] transition-colors inline-flex items-center gap-1"
            >
              <span>{lnk.label}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Section 3 — New Arrivals */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="border-t border-[#ECE9E2]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                Fresh Drops
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/new-arrivals"
              className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Shop New Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
            {newArrivals.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 4 — Trending This Week */}
      {trendingItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="border-t border-[#ECE9E2] bg-[#F7F6F2]"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#1B2A4A]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                    Most Loved Right Now
                  </p>
                </div>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                  Trending This Week
                </h2>
              </div>
              <Link
                to="/women"
                className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <span>Shop All Trending</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
              {trendingItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Section 5 — Special Collection Promotional Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="bg-[#1B2A4A] text-white"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-6 lg:col-span-5 relative aspect-[4/5] max-h-[460px] md:max-h-[540px] md:aspect-auto md:min-h-[420px] lg:min-h-[480px] overflow-hidden bg-[#ECE9E2]">
            <ResolvedImage
              src={specialImage}
              alt={specialHeading}
              className="w-full h-full object-cover object-[50%_15%]"
            />
          </div>
          <div className="md:col-span-6 lg:col-span-7 px-5 sm:px-8 lg:px-14 py-8 sm:py-10 lg:py-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#C8D3E8]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8D3E8]">
                {specialLabel}
              </p>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight max-w-xl">
              {specialHeading}
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/85 leading-relaxed max-w-md">
              {specialSubheading}
            </p>
            <div className="mt-6 sm:mt-8">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#ECE9E2] text-[#1B2A4A] text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 6 — Best Sellers */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16"
      >
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
              Customer Favourites
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/best-sellers"
            className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Explore Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </motion.section>

      {/* Section 7 — Shop Your Style (Multi-Model Editorial Grid) */}
      {shopYourStyleItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="border-t border-[#ECE9E2] bg-[#F7F6F2]"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                  Silhouettes &amp; Fits
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                  Shop Your Style
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5C5E64] max-w-md">
                From campus mornings to coffee catch-ups — pick the silhouette made for your day.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {shopYourStyleItems.map((card) => (
                <Link
                  key={card.id}
                  to={card.targetUrl}
                  className="group bg-white border border-[#ECE9E2] overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/5] bg-[#ECE9E2] overflow-hidden">
                    <ResolvedImage
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex items-center justify-between gap-2 flex-1">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm sm:text-lg font-semibold text-[#1E2022] group-hover:text-[#1B2A4A] transition-colors line-clamp-2 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#5C5E64] mt-0.5 line-clamp-2 leading-snug">
                        {card.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#1E2022] group-hover:text-[#1B2A4A] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Section 8 — Featured Edit & Seasonal Offers */}
      {(featuredProducts.length > 0 || activePromotions.length > 0) && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="border-t border-[#ECE9E2] bg-white"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16 space-y-10 sm:space-y-12">
            {/* Active Offers Highlight */}
            {activePromotions.length > 0 && (
              <div>
                <div className="flex items-end justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                      Special Offers
                    </p>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                      Current Wardrobe Offers
                    </h2>
                  </div>
                  <Link
                    to="/offers"
                    className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>All Offers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {activePromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="p-5 sm:p-6 bg-[#F7F6F2] border border-[#ECE9E2] flex flex-col justify-between gap-4"
                    >
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1B2A4A]">
                          {promo.discountLabel}
                        </span>
                        <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-semibold text-[#1E2022]">
                          {promo.title}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-[#5C5E64] leading-relaxed">
                          {promo.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECE9E2]">
                        <button
                          type="button"
                          onClick={() => handleCopyPromo(promo.code)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ECE9E2] hover:border-[#1B2A4A] text-xs font-mono font-semibold text-[#1E2022] transition-colors active:scale-[0.98]"
                        >
                          <span>CODE: {promo.code}</span>
                          {copiedCode === promo.code ? (
                            <Check className="w-3.5 h-3.5 text-[#1B2A4A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#5C5E64]" />
                          )}
                        </button>
                        <Link
                          to={promo.targetUrl}
                          className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5"
                        >
                          <span>Shop Offer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Collection Picks */}
            {featuredProducts.length > 0 && (
              <div>
                <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                      Editor&apos;s Selection
                    </p>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                      Featured Pieces
                    </h2>
                  </div>
                  <Link
                    to="/collections"
                    className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>View All Featured</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Section 9 — Customer Reviews */}
      {customerReviews.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="border-t border-[#ECE9E2] bg-[#F7F6F2]"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <div className="max-w-xl mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                Verified Wardrobe Notes
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                Loved by Women Across India
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {customerReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#ECE9E2] p-5 sm:p-6 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-0.5 text-[#1B2A4A]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-[#1B2A4A]" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-[#1E2022] leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#ECE9E2] flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[#1E2022] shrink-0">{rev.author}</span>
                    <Link
                      to={`/product/${rev.productSlug}`}
                      className="text-[#1B2A4A] hover:underline truncate min-w-0 flex-1 text-right"
                    >
                      {rev.productName}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Section 10 — Why Shop With Flivio */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="border-t border-[#ECE9E2] bg-white"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="max-w-xl mb-7 sm:mb-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
              The FLIVIO Promise
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
              Why Shop With Flivio
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              {
                icon: Sparkles,
                title: 'Breathable Fabrics',
                desc: 'Soft 60s cottons, slub weaves, and combed jersey made for Indian weather.',
              },
              {
                icon: Tag,
                title: 'Everyday Pricing',
                desc: 'Embroidered tops, Korean puff tops, floral prints & short kurtis starting at ₹399.',
              },
              {
                icon: MessageCircle,
                title: 'Personal Ordering',
                desc: 'Fast checkout that sends your structured order directly on WhatsApp.',
              },
              {
                icon: Headphones,
                title: 'Studio Support',
                desc: 'Real fit guidance and prompt tracking updates directly from our team.',
              },
              {
                icon: ShieldCheck,
                title: 'Trusted Privacy',
                desc: 'Your delivery details are used solely for fulfilling your order.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 border border-[#ECE9E2] bg-[#F7F6F2] sm:last:col-span-2 lg:last:col-span-1"
              >
                <item.icon className="w-5 h-5 text-[#1B2A4A] stroke-[1.5]" />
                <h3 className="mt-3 text-sm font-semibold text-[#1E2022]">{item.title}</h3>
                <p className="mt-1.5 text-xs text-[#5C5E64] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 11 — Instagram Lookbook ("THE FLIVIO LOOK") */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="border-t border-[#ECE9E2] bg-white"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
                Community &amp; Lookbook
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                {siteContent.instagramHeading}
              </h2>
            </div>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A]"
            >
              <Instagram className="w-4 h-4" />
              <span>{siteContent.instagramHandle}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {siteContent.instagramGallery.map((imgUrl, idx) => (
              <a
                key={`${imgUrl}_${idx}`}
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group aspect-[4/5] bg-[#F7F6F2] overflow-hidden border border-[#ECE9E2] block"
              >
                <ResolvedImage
                  src={imgUrl}
                  alt={`FLIVIO lookbook ${idx + 1}`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </a>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 12 — Newsletter Signup */}
      <section className="border-t border-[#ECE9E2] bg-[#ECE9E2]/45">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B2A4A]">
            Stay Updated
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
            Join The FLIVIO Edit
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5C5E64] max-w-md mx-auto leading-relaxed">
            Receive first access to fresh top drops, cotton short kurtis, restock alerts, and subscriber-only wardrobe offers.
          </p>

          {subscribed ? (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#ECE9E2] text-xs font-semibold text-[#1E2022]">
              <Check className="w-4 h-4 text-[#1B2A4A]" />
              <span>You&apos;re subscribed to The FLIVIO Edit.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 text-base sm:text-xs bg-white border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none text-[#1E2022]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98] whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
