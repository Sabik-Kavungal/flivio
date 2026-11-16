import React, { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { calculateDiscountPercentage, formatINR } from '../../utils/format';
import { ResolvedImage } from '../common/ResolvedImage';
import { prefetchRoute } from '../../utils/routePrefetch';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCardInner: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  // Targeted selectors prevent unrelated store updates from re-rendering every card
  const isWishlisted = useStore((s) => s.wishlist.some((w) => w.productId === product.id));
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const setQuickViewProductId = useStore((s) => s.setQuickViewProductId);
  const addToCart = useStore((s) => s.addToCart);

  const [justAdded, setJustAdded] = useState(false);
  const [heartAnimated, setHeartAnimated] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 1100);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  useEffect(() => {
    if (!heartAnimated) return;
    const t = window.setTimeout(() => setHeartAnimated(false), 280);
    return () => window.clearTimeout(t);
  }, [heartAnimated]);

  const mainImage =
    product.images.find((img) => img.isMain)?.url || product.images[0]?.url || '';
  const secondaryImage = product.images.find((img) => img.url !== mainImage)?.url;

  const activeVariants = product.variants.filter((v) => v.isActive);
  const displayPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.sellingPrice))
      : product.sellingPrice;
  const matchingVariant =
    activeVariants.find((v) => v.sellingPrice === displayPrice) || activeVariants[0];
  const displayOriginal = matchingVariant?.originalPrice || product.originalPrice;
  const discount = calculateDiscountPercentage(displayOriginal, displayPrice);

  const firstInStockVariant =
    activeVariants.find((v) => v.stock > 0 && v.size === 'M') ||
    activeVariants.find((v) => v.stock > 0) ||
    activeVariants[0];

  const uniqueColours = Array.from(
    new Map(
      activeVariants.map((v) => [v.colour, { colour: v.colour, hex: v.colourHex }])
    ).values()
  );

  const badgeText =
    discount > 0
      ? `-${discount}%`
      : product.isTrending
      ? 'TRENDING'
      : product.isNewArrival
      ? 'NEW'
      : product.isBestSeller
      ? 'BEST SELLER'
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (justAdded) return;
    if (activeVariants.length > 1) {
      setQuickViewProductId(product.id);
      return;
    }
    if (firstInStockVariant && firstInStockVariant.stock > 0) {
      addToCart(product, firstInStockVariant, 1, true);
      setJustAdded(true);
    } else {
      setQuickViewProductId(product.id);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimated(true);
    toggleWishlist(product.id);
  };

  const handlePrefetch = () => prefetchRoute(`/product/${product.slug}`);

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div className="relative aspect-[4/5] bg-[#F7F6F2] overflow-hidden border border-[#ECE9E2]/80">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full"
          aria-label={`View ${product.name}`}
        >
          <ResolvedImage
            src={mainImage}
            alt={product.name}
            fallbackLabel={product.name}
            priority={priority}
            className={`w-full h-full object-cover object-top transition-all duration-300 ease-out will-change-transform ${
              secondaryImage
                ? 'group-hover:opacity-0 group-hover:scale-[1.03]'
                : 'group-hover:scale-[1.04]'
            }`}
          />
          {secondaryImage && (
            <ResolvedImage
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fallbackLabel={product.name}
              className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300 ease-out will-change-transform"
            />
          )}
        </Link>

        {/* Single clean corner tag */}
        {badgeText && (
          <span
            className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase pointer-events-none ${
              discount > 0
                ? 'bg-[#1B2A4A] text-white'
                : product.isTrending
                ? 'bg-[#1E2022] text-white'
                : 'bg-white/95 text-[#1E2022] border border-[#ECE9E2]'
            }`}
          >
            {badgeText}
          </span>
        )}

        {/* Wishlist toggle with pop feedback */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 flex items-center justify-center bg-white/95 hover:bg-white border border-[#ECE9E2] transition-all active:scale-90 ${
            isWishlisted ? 'text-[#1B2A4A]' : 'text-[#1E2022]'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              isWishlisted ? 'fill-[#1B2A4A]' : ''
            } ${heartAnimated ? 'animate-heart-pop' : ''}`}
          />
        </button>

        {/* Mobile Quick Add / Variant Picker trigger */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.name} to bag`}
          className={`md:hidden absolute bottom-2 right-2 w-8 h-8 border transition-all active:scale-90 flex items-center justify-center shadow-sm ${
            justAdded
              ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white'
              : 'bg-white/95 border-[#ECE9E2] text-[#1E2022]'
          }`}
        >
          {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
        </button>

        {/* Desktop & Tablet Quick View + Quick Add Hover Bar */}
        <div className="hidden md:grid grid-cols-2 gap-1.5 absolute inset-x-2 lg:inset-x-2.5 bottom-2 lg:bottom-2.5 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuickViewProductId(product.id);
            }}
            className="py-1.5 lg:py-2 px-1.5 lg:px-2 bg-white/95 hover:bg-[#1E2022] hover:text-white text-[#1E2022] text-[9px] lg:text-[10px] font-semibold tracking-wider uppercase border border-[#ECE9E2] flex items-center justify-center gap-1 transition-colors active:scale-[0.98] whitespace-nowrap"
          >
            <Eye className="w-3 h-3 shrink-0" />
            <span>Quick View</span>
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`py-1.5 lg:py-2 px-1.5 lg:px-2 text-white text-[9px] lg:text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1 transition-colors active:scale-[0.98] whitespace-nowrap ${
              justAdded ? 'bg-[#1B2A4A]' : 'bg-[#1E2022]/95 hover:bg-[#1B2A4A]'
            }`}
          >
            {justAdded ? <Check className="w-3 h-3 shrink-0" /> : <ShoppingBag className="w-3 h-3 shrink-0" />}
            <span>{justAdded ? 'Added' : 'Quick Add'}</span>
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="pt-2.5 sm:pt-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] tracking-wider uppercase text-[#5C5E64] truncate">
              {product.categoryName}
            </span>
            {uniqueColours.length > 0 && (
              <div className="flex items-center gap-1 shrink-0" aria-label="Available colours">
                {uniqueColours.slice(0, 4).map((c) => (
                  <span
                    key={c.colour}
                    title={c.colour}
                    className="w-2.5 h-2.5 border border-[#D3CFC7]"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="mt-1 block text-xs sm:text-sm font-medium text-[#1E2022] hover:text-[#1B2A4A] transition-colors line-clamp-2 min-h-[2.125rem] sm:min-h-[2.5rem] leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-xs sm:text-sm font-semibold text-[#1E2022]">
            {formatINR(displayPrice)}
          </span>
          {discount > 0 && (
            <span className="text-[11px] sm:text-xs text-[#86888E] line-through">
              {formatINR(displayOriginal)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProductCard = memo(ProductCardInner);
