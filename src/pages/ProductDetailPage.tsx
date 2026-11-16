import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  Minus,
  Plus,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  ShoppingBag,
  ArrowRight,
  ZoomIn,
  Ruler,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { ProductCard } from '../components/product/ProductCard';
import { calculateDiscountPercentage, formatINR } from '../utils/format';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const settings = useStore((s) => s.settings);
  const recentlyViewedIds = useStore((s) => s.recentlyViewedIds);
  const recordRecentlyViewed = useStore((s) => s.recordRecentlyViewed);

  const product = products.find((p) => p.slug === slug);

  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [fullscreenOpen, setFullscreenOpen] = useState<boolean>(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const addedTimerRef = useRef<number | null>(null);

  const activeVariants = useMemo(
    () => product?.variants.filter((v) => v.isActive) || [],
    [product]
  );

  useEffect(() => {
    if (!product) return;
    recordRecentlyViewed(product.id);
    const firstAvailable = activeVariants.find((v) => v.stock > 0) || activeVariants[0];
    if (firstAvailable) {
      setSelectedColour(firstAvailable.colour);
      setSelectedSize(firstAvailable.size);
    }
    setQuantity(1);
    setActiveImageIdx(0);
    setIsZoomed(false);
    setJustAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    };
  }, []);

  const galleryItems = useMemo(() => {
    if (!product) return [];
    const sortedParent = [...product.images].sort((a, b) => a.order - b.order);
    const parentByUrl = new Map(sortedParent.map((i) => [i.url, i.angleLabel]));

    const variantForColour = activeVariants.find((v) => v.colour === selectedColour);
    const variantUrls = variantForColour?.images?.filter(Boolean) || [];

    const orderedUrls = Array.from(
      new Set([...variantUrls, ...sortedParent.map((i) => i.url)])
    );

    return orderedUrls.map((url, idx) => ({
      url,
      label:
        parentByUrl.get(url) ||
        (idx === 0 ? 'Front View' : `View ${idx + 1}`),
    }));
  }, [product, activeVariants, selectedColour]);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedColour]);

  useEffect(() => {
    if (!sizeGuideOpen && !fullscreenOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSizeGuideOpen(false);
        setFullscreenOpen(false);
      } else if (fullscreenOpen && galleryItems.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActiveImageIdx((prev) =>
            prev === 0 ? galleryItems.length - 1 : prev - 1
          );
        } else if (e.key === 'ArrowRight') {
          setActiveImageIdx((prev) => (prev + 1) % galleryItems.length);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [sizeGuideOpen, fullscreenOpen, galleryItems.length]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#1E2022]">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-[#5C5E64]">
          The piece you are looking for may have been archived or moved.
        </p>
        <Link
          to="/women"
          className="mt-6 inline-block px-6 py-3 bg-[#1E2022] text-white text-xs font-semibold uppercase tracking-wider"
        >
          Browse Women&apos;s Collection
        </Link>
      </div>
    );
  }

  const productCategory = categories.find((c) => c.id === product.categoryId);
  const categorySlug =
    productCategory?.slug || product.categoryName.toLowerCase().replace(/\s+/g, '-');

  const colours = Array.from(
    new Map(
      activeVariants.map((v) => [v.colour, { colour: v.colour, hex: v.colourHex }])
    ).values()
  );
  const sizesForColour = activeVariants.filter((v) => v.colour === selectedColour);
  const selectedVariant =
    sizesForColour.find((v) => v.size === selectedSize) ||
    sizesForColour.find((v) => v.stock > 0) ||
    sizesForColour[0];

  const sellingPrice = selectedVariant?.sellingPrice ?? product.sellingPrice;
  const originalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const discount = calculateDiscountPercentage(originalPrice, sellingPrice);
  const isWishlisted = wishlist.some((w) => w.productId === product.id);
  const stockCount = selectedVariant?.stock ?? 0;

  const activeImgItem = galleryItems[activeImageIdx] || galleryItems[0];
  const activeImgSrc = activeImgItem?.url || '';

  const relatedProducts = products
    .filter((p) => p.isActive && p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const youMayLikeProducts = products
    .filter(
      (p) =>
        p.isActive &&
        p.id !== product.id &&
        p.categoryId !== product.categoryId &&
        (product.audience ? p.audience === product.audience : true)
    )
    .slice(0, 4);

  const recentlyViewedProducts = recentlyViewedIds
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id && p.isActive))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : null;

  const handleAddToBag = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addToCart(product, selectedVariant, quantity, true);
    setJustAdded(true);
    if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addToCart(product, selectedVariant, quantity, false);
    navigate('/checkout');
  };

  const isWomensItem =
    product.audience === 'women' || productCategory?.audience === 'women';

  return (
    <div className="bg-white pb-24 lg:pb-14 text-[#1E2022]">
      {/* Breadcrumb */}
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-3.5 text-xs text-[#5C5E64] flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-[#1E2022]">Home</Link>
          <span>/</span>
          <Link
            to={isWomensItem ? '/women' : '/shop'}
            className="hover:text-[#1E2022]"
          >
            {isWomensItem ? 'Women' : 'Shop'}
          </Link>
          <span>/</span>
          <Link
            to={`/category/${categorySlug}`}
            className="hover:text-[#1E2022]"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[#1E2022] font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 lg:gap-12">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-6">
            <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 max-w-[600px] mx-auto lg:max-w-none lg:mx-0">
              {/* Thumbnails with subtle angle label */}
              {galleryItems.length > 1 && (
                <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible md:w-20 shrink-0 no-scrollbar">
                  {galleryItems.map((item, idx) => (
                    <button
                      key={`${item.url}_${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 md:w-20 shrink-0 flex flex-col border overflow-hidden transition-all bg-[#F7F6F2] ${
                        idx === activeImageIdx
                          ? 'border-[#1B2A4A] ring-1 ring-[#1B2A4A]/20'
                          : 'border-[#ECE9E2] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full aspect-[4/5] overflow-hidden">
                        <ResolvedImage
                          src={item.url}
                          alt={`${product.name} — ${item.label}`}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <span className="py-1 px-1 text-[9px] font-medium uppercase tracking-wider text-[#5C5E64] truncate w-full text-center bg-white border-t border-[#ECE9E2]">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Main 4:5 Image Stage with Smooth Transition, Zoom & Mobile Swipe */}
              <div
                className="relative flex-1 aspect-[4/5] bg-[#F7F6F2] border border-[#ECE9E2] overflow-hidden select-none"
                onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchStartX === null || galleryItems.length <= 1) return;
                  const diff = e.changedTouches[0].clientX - touchStartX;
                  if (diff > 45) {
                    setActiveImageIdx((prev) =>
                      prev === 0 ? galleryItems.length - 1 : prev - 1
                    );
                  } else if (diff < -45) {
                    setActiveImageIdx((prev) => (prev + 1) % galleryItems.length);
                  }
                  setTouchStartX(null);
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.button
                    key={activeImgSrc}
                    type="button"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.7 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsZoomed((z) => !z)}
                    className="w-full h-full block cursor-zoom-in"
                    aria-label="Toggle image zoom"
                  >
                    <ResolvedImage
                      src={activeImgSrc}
                      alt={`${product.name} — ${activeImgItem?.label || 'View'}`}
                      loading="eager"
                      className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                      }`}
                    />
                  </motion.button>
                </AnimatePresence>

                {/* Current angle caption */}
                {activeImgItem?.label && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 border border-[#ECE9E2] text-[10px] font-semibold uppercase tracking-wider text-[#1E2022]">
                    {activeImgItem.label}
                  </span>
                )}

                {/* Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsZoomed((z) => !z)}
                    aria-label="Zoom image"
                    className="w-9 h-9 bg-white/95 border border-[#ECE9E2] flex items-center justify-center text-[#1E2022] hover:text-[#1B2A4A]"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullscreenOpen(true)}
                    aria-label="Open fullscreen viewer"
                    className="w-9 h-9 bg-white/95 border border-[#ECE9E2] flex items-center justify-center text-[#1E2022] hover:text-[#1B2A4A]"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {galleryItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === 0 ? galleryItems.length - 1 : prev - 1
                        )
                      }
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-[#ECE9E2] flex items-center justify-center text-[#1E2022] hover:border-[#1E2022]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) => (prev + 1) % galleryItems.length)
                      }
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-[#ECE9E2] flex items-center justify-center text-[#1E2022] hover:border-[#1E2022]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Mobile swipe dots */}
                    <div className="md:hidden absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-white/90 border border-[#ECE9E2]">
                      {galleryItems.map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            idx === activeImageIdx ? 'bg-[#1B2A4A]' : 'bg-[#D3CFC7]'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Purchase Module */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-24 space-y-5 sm:space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#5C5E64]">
                  <span className="uppercase tracking-wider truncate">{product.categoryName}</span>
                  {selectedVariant && (
                    <span className="font-mono text-[11px] shrink-0">SKU: {selectedVariant.sku}</span>
                  )}
                </div>

                <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
                  {product.name}
                </h1>

                {avgRating && product.reviews && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#1E2022]">
                    <div className="flex items-center gap-0.5 text-[#1B2A4A]">
                      <Star className="w-3.5 h-3.5 fill-[#1B2A4A]" />
                      <span className="font-semibold tabular-nums">{avgRating}</span>
                    </div>
                    <span className="text-[#86888E]">·</span>
                    <span className="text-[#5C5E64]">
                      {product.reviews.length} verified review{product.reviews.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="mt-3.5 flex items-baseline gap-3 tabular-nums">
                  <span className="text-2xl font-semibold text-[#1E2022]">
                    {formatINR(sellingPrice)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-base text-[#86888E] line-through">
                        {formatINR(originalPrice)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#5C5E64]">Inclusive of all taxes</p>
              </div>

              <p className="text-sm text-[#5C5E64] leading-relaxed">{product.description}</p>

              {/* Colour Selector */}
              {colours.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                    Colour:{' '}
                    <span className="font-normal normal-case text-[#5C5E64]">
                      {selectedColour}
                    </span>
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {colours.map((c) => {
                      const active = c.colour === selectedColour;
                      return (
                        <button
                          key={c.colour}
                          type="button"
                          onClick={() => {
                            setSelectedColour(c.colour);
                            const nextSize =
                              activeVariants.find(
                                (v) => v.colour === c.colour && v.stock > 0
                              ) || activeVariants.find((v) => v.colour === c.colour);
                            if (nextSize) setSelectedSize(nextSize.size);
                            setQuantity(1);
                          }}
                          className={`px-3 py-2 text-xs border flex items-center gap-2 transition-colors active:scale-[0.98] ${
                            active
                              ? 'border-[#1B2A4A] bg-[#F7F6F2] text-[#1E2022] font-semibold'
                              : 'border-[#ECE9E2] text-[#5C5E64] hover:border-[#1E2022]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 border border-black/15"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.colour}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector + Size Guide */}
              {sizesForColour.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold uppercase tracking-wider text-[#1E2022]">
                        Size
                      </span>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B2A4A] hover:underline"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>Size Guide</span>
                      </button>
                    </div>
                    <span
                      className={`font-medium ${
                        stockCount > 5
                          ? 'text-emerald-700'
                          : stockCount > 0
                          ? 'text-[#1B2A4A]'
                          : 'text-red-600'
                      }`}
                    >
                      {stockCount > 5
                        ? 'In Stock'
                        : stockCount > 0
                        ? `Only ${stockCount} left`
                        : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {sizesForColour.map((variant) => {
                      const active = selectedVariant?.id === variant.id;
                      const oos = variant.stock <= 0;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={oos}
                          onClick={() => {
                            setSelectedSize(variant.size);
                            setQuantity(1);
                          }}
                          className={`min-w-[46px] h-11 px-3.5 text-xs font-semibold border transition-colors active:scale-[0.97] ${
                            oos
                              ? 'border-[#ECE9E2] bg-[#F7F6F2] text-[#A8A9AE] line-through cursor-not-allowed'
                              : active
                              ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                              : 'border-[#ECE9E2] text-[#1E2022] hover:border-[#1E2022]'
                          }`}
                        >
                          {variant.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Actions (Fits cleanly down to 320px width) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="inline-flex items-center border border-[#ECE9E2] h-11 sm:h-12 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-8 sm:w-10 h-full flex items-center justify-center text-[#1E2022] hover:bg-[#F7F6F2] active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 sm:w-9 text-center text-sm font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= stockCount}
                      onClick={() => setQuantity((q) => Math.min(stockCount || 1, q + 1))}
                      aria-label="Increase quantity"
                      className="w-8 sm:w-10 h-full flex items-center justify-center text-[#1E2022] hover:bg-[#F7F6F2] disabled:opacity-40 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedVariant || stockCount <= 0}
                    onClick={handleAddToBag}
                    className={`flex-1 min-w-0 h-11 sm:h-12 px-2.5 sm:px-5 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-colors active:scale-[0.98] ${
                      justAdded
                        ? 'bg-[#1B2A4A]'
                        : 'bg-[#1E2022] hover:bg-[#1B2A4A] disabled:bg-[#A8A9AE]'
                    }`}
                  >
                    {justAdded ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">
                      {stockCount <= 0
                        ? 'Out of Stock'
                        : justAdded
                        ? 'Added to Bag'
                        : 'Add to Bag'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Toggle wishlist"
                    className={`w-10 sm:w-12 h-11 sm:h-12 shrink-0 border flex items-center justify-center transition-colors active:scale-95 ${
                      isWishlisted
                        ? 'border-[#1B2A4A] text-[#1B2A4A] bg-[#F7F6F2]'
                        : 'border-[#ECE9E2] text-[#1E2022] hover:border-[#1E2022]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#1B2A4A]' : ''}`} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!selectedVariant || stockCount <= 0}
                  onClick={handleBuyNow}
                  className="w-full h-11 sm:h-12 border border-[#1E2022] text-[#1E2022] hover:bg-[#1E2022] hover:text-white disabled:opacity-40 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <span>Buy Now via WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Product Specifications Tabs */}
              <div className="pt-4 border-t border-[#ECE9E2]">
                <div
                  role="tablist"
                  aria-label="Product information tabs"
                  className="flex items-center gap-5 sm:gap-6 border-b border-[#ECE9E2] overflow-x-auto no-scrollbar"
                >
                  {[
                    { id: 'details', label: 'Details & Fit' },
                    { id: 'care', label: 'Care' },
                    { id: 'shipping', label: 'Shipping & Returns' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === t.id}
                      onClick={() => setActiveTab(t.id as typeof activeTab)}
                      className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === t.id
                          ? 'border-[#1B2A4A] text-[#1E2022]'
                          : 'border-transparent text-[#5C5E64] hover:text-[#1E2022]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 text-xs text-[#5C5E64] leading-relaxed space-y-2">
                  {activeTab === 'details' && (
                    <>
                      <p>
                        <strong className="text-[#1E2022]">Material:</strong> {product.material}
                      </p>
                      <p>
                        <strong className="text-[#1E2022]">Fit:</strong> {product.fit}
                      </p>
                      <p>
                        <strong className="text-[#1E2022]">Available Sizes:</strong>{' '}
                        {Array.from(new Set(activeVariants.map((v) => v.size))).join(', ')}
                      </p>
                    </>
                  )}
                  {activeTab === 'care' && <p>{product.careInstructions}</p>}
                  {activeTab === 'shipping' && (
                    <div className="space-y-2">
                      <p>{settings.shippingPolicy}</p>
                      <p>{settings.returnPolicy}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List if present */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="pt-4 border-t border-[#ECE9E2] space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                    Customer Reviews
                  </h3>
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-[#F7F6F2] border border-[#ECE9E2]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1E2022]">{rev.author}</span>
                        <span className="text-[#5C5E64] tabular-nums">{rev.date}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#5C5E64]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-[#ECE9E2]">
            <h2 className="font-display text-2xl font-semibold text-[#1E2022] mb-6">
              Related Styles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* You May Also Like */}
        {youMayLikeProducts.length > 0 && (
          <section className="mt-12 sm:mt-14 pt-10 sm:pt-12 border-t border-[#ECE9E2]">
            <h2 className="font-display text-2xl font-semibold text-[#1E2022] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {youMayLikeProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <section className="mt-12 sm:mt-14 pt-10 sm:pt-12 border-t border-[#ECE9E2]">
            <h2 className="font-display text-2xl font-semibold text-[#1E2022] mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Compact Mobile Sticky Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-t border-[#ECE9E2] px-3 sm:px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#1E2022] truncate">{product.name}</p>
          <p className="text-sm font-semibold tabular-nums text-[#1E2022] truncate">
            {formatINR(sellingPrice)}{' '}
            <span className="text-[11px] font-normal text-[#5C5E64]">
              · {selectedColour}
              {selectedVariant?.size ? ` · Size ${selectedVariant.size}` : ''}
            </span>
          </p>
        </div>
        <button
          type="button"
          disabled={!selectedVariant || stockCount <= 0}
          onClick={handleAddToBag}
          className={`px-4 sm:px-5 py-2.5 text-white text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors active:scale-[0.98] inline-flex items-center gap-1.5 ${
            justAdded
              ? 'bg-[#1B2A4A]'
              : 'bg-[#1E2022] hover:bg-[#1B2A4A] disabled:bg-[#A8A9AE]'
          }`}
        >
          {justAdded ? <Check className="w-3.5 h-3.5" /> : null}
          <span>
            {stockCount <= 0 ? 'Out of Stock' : justAdded ? 'Added' : 'Add to Bag'}
          </span>
        </button>
      </div>

      {/* Animated Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSizeGuideOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-[#ECE9E2] max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#ECE9E2] pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1B2A4A]">
                    FLIVIO Fit Standards
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#1E2022]">
                    {isWomensItem ? "Women's Tops & Short Kurtis Size Guide" : 'Garment Size Guide'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(false)}
                  aria-label="Close size guide"
                  className="p-1.5 text-[#5C5E64] hover:text-[#1E2022]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isWomensItem ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#ECE9E2]">
                    <thead className="bg-[#F7F6F2] text-[#1E2022] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Size</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Bust (in)</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Waist (in)</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Hip (in)</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE9E2] tabular-nums">
                      {[
                        { s: 'XS', b: '32', w: '26', h: '35', l: '27' },
                        { s: 'S', b: '34', w: '28', h: '37', l: '27.5' },
                        { s: 'M', b: '36', w: '30', h: '39', l: '28' },
                        { s: 'L', b: '38', w: '32', h: '41', l: '28.5' },
                        { s: 'XL', b: '40', w: '34', h: '43', l: '29' },
                      ].map((row) => (
                        <tr key={row.s} className="hover:bg-[#F7F6F2]/60">
                          <td className="py-2.5 px-3 font-semibold text-[#1E2022]">{row.s}</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.b}&quot;</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.w}&quot;</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.h}&quot;</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.l}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#ECE9E2]">
                    <thead className="bg-[#F7F6F2] text-[#1E2022] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Size</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Chest (in)</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Shoulder (in)</th>
                        <th className="py-2.5 px-3 border-b border-[#ECE9E2]">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE9E2] tabular-nums">
                      {[
                        { s: 'S', c: '38', sh: '17', l: '27' },
                        { s: 'M', c: '40', sh: '17.8', l: '28' },
                        { s: 'L', c: '42', sh: '18.5', l: '29' },
                        { s: 'XL', c: '44', sh: '19.2', l: '30' },
                        { s: 'XXL', c: '46', sh: '20', l: '31' },
                      ].map((row) => (
                        <tr key={row.s} className="hover:bg-[#F7F6F2]/60">
                          <td className="py-2.5 px-3 font-semibold text-[#1E2022]">{row.s}</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.c}&quot;</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.sh}&quot;</td>
                          <td className="py-2.5 px-3 text-[#5C5E64]">{row.l}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-[#5C5E64] bg-[#F7F6F2] border border-[#ECE9E2] p-3">
                Between two sizes? We recommend sizing up for a relaxed, airy cotton drape.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Fullscreen Lightbox Viewer */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setFullscreenOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              aria-label="Close fullscreen viewer"
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-3xl max-h-[88vh] w-full flex items-center justify-center">
              <ResolvedImage
                src={activeImgSrc}
                alt={product.name}
                className="max-h-[85vh] w-auto object-contain"
              />
            </div>
            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx((prev) =>
                      prev === 0 ? galleryItems.length - 1 : prev - 1
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev + 1) % galleryItems.length)
                  }
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
