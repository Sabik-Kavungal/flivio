import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { formatINR } from '../utils/format';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, toggleWishlist, setQuickViewProductId } = useStore();

  const savedProducts = wishlist
    .map((w) => products.find((p) => p.id === w.productId && p.isActive))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B2A4A]">
            Personal Curation
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#1E2022]">
            Saved Wishlist
          </h1>
          <p className="mt-1 text-sm text-[#5C5E64] tabular-nums">
            {savedProducts.length} saved {savedProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">
        {savedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="py-16 text-center border border-[#ECE9E2] bg-[#F7F6F2] px-6"
          >
            <Heart className="w-10 h-10 text-[#A8A9AE] stroke-[1.25] mx-auto mb-3" />
            <h2 className="text-lg font-medium text-[#1E2022]">No items saved yet</h2>
            <p className="text-sm text-[#5C5E64] mt-1 max-w-md mx-auto">
              Tap the heart icon on any piece to save it here while you curate your wardrobe.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {savedProducts.map((product) => {
              const img =
                product.images.find((i) => i.isMain)?.url || product.images[0]?.url;
              const discountPct =
                product.originalPrice > product.sellingPrice
                  ? Math.round(
                      ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
                    )
                  : 0;
              return (
                <div
                  key={product.id}
                  className="border border-[#ECE9E2] bg-white flex flex-col group"
                >
                  <div className="relative aspect-[4/5] bg-[#F7F6F2] overflow-hidden">
                    <Link to={`/product/${product.slug}`} className="block w-full h-full">
                      <ResolvedImage
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    {discountPct > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#1B2A4A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        -{discountPct}%
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/95 text-[#5C5E64] hover:text-red-600 transition-colors active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#5C5E64] block truncate">
                        {product.categoryName}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="mt-1 block text-xs sm:text-sm font-medium text-[#1E2022] hover:text-[#1B2A4A] line-clamp-2 min-h-[2.125rem] sm:min-h-[2.5rem] leading-snug transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs sm:text-sm font-semibold tabular-nums text-[#1E2022]">
                          {formatINR(product.sellingPrice)}
                        </span>
                        {product.originalPrice > product.sellingPrice && (
                          <span className="text-[11px] text-[#86888E] line-through tabular-nums">
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickViewProductId(product.id)}
                      className="w-full py-2.5 px-2 sm:px-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Select Size</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
