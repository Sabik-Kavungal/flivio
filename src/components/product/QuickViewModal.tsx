import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { calculateDiscountPercentage, formatINR } from '../../utils/format';
import { ResolvedImage } from '../common/ResolvedImage';

export const QuickViewModal: React.FC = () => {
  const quickViewProductId = useStore((s) => s.quickViewProductId);
  const setQuickViewProductId = useStore((s) => s.setQuickViewProductId);
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);

  const product = products.find((p) => p.id === quickViewProductId);
  const activeVariants = product?.variants.filter((v) => v.isActive) || [];

  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    const firstAvailable = activeVariants.find((v) => v.stock > 0) || activeVariants[0];
    if (firstAvailable) {
      setSelectedColour(firstAvailable.colour);
      setSelectedSize(firstAvailable.size);
    }
  }, [quickViewProductId]);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewProductId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [product, setQuickViewProductId]);

  const colours = Array.from(
    new Map(activeVariants.map((v) => [v.colour, { colour: v.colour, hex: v.colourHex }])).values()
  );
  const sizesForColour = activeVariants.filter((v) => v.colour === selectedColour);
  const selectedVariant =
    sizesForColour.find((v) => v.size === selectedSize) ||
    sizesForColour.find((v) => v.stock > 0) ||
    sizesForColour[0];

  const previewImage =
    selectedVariant?.images?.[0] ||
    product?.images.find((i) => i.isMain)?.url ||
    product?.images[0]?.url ||
    '';

  const price = selectedVariant?.sellingPrice ?? product?.sellingPrice ?? 0;
  const origPrice = selectedVariant?.originalPrice ?? product?.originalPrice ?? 0;
  const discount = calculateDiscountPercentage(origPrice, price);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickViewProductId(null);
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quickview-title"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-[#ECE9E2] max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="relative aspect-[4/5] max-h-[340px] sm:max-h-[400px] md:max-h-none md:aspect-auto md:min-h-[420px] bg-[#F7F6F2] overflow-hidden">
              <ResolvedImage
                src={previewImage}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
              <button
                type="button"
                onClick={() => setQuickViewProductId(null)}
                aria-label="Close quick view"
                className="md:hidden absolute top-3 right-3 w-8 h-8 bg-white border border-[#ECE9E2] flex items-center justify-center text-[#1E2022]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#5C5E64]">
                    {product.categoryName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickViewProductId(null)}
                    aria-label="Close quick view"
                    className="hidden md:flex w-8 h-8 items-center justify-center text-[#5C5E64] hover:text-[#1E2022]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2
                  id="quickview-title"
                  className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#1E2022]"
                >
                  {product.name}
                </h2>

                <div className="mt-3 flex items-baseline gap-2.5 tabular-nums">
                  <span className="text-lg font-semibold text-[#1E2022]">{formatINR(price)}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-sm text-[#86888E] line-through">
                        {formatINR(origPrice)}
                      </span>
                      <span className="text-xs font-semibold text-[#1B2A4A]">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-3 text-xs text-[#5C5E64] leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Colour Selector */}
                {colours.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-medium text-[#1E2022]">
                      Colour: <span className="text-[#5C5E64]">{selectedColour}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colours.map((c) => {
                        const active = c.colour === selectedColour;
                        return (
                          <button
                            key={c.colour}
                            type="button"
                            onClick={() => {
                              setSelectedColour(c.colour);
                              const firstSize =
                                activeVariants.find(
                                  (v) => v.colour === c.colour && v.stock > 0
                                ) || activeVariants.find((v) => v.colour === c.colour);
                              if (firstSize) setSelectedSize(firstSize.size);
                            }}
                            className={`px-3 py-1.5 text-xs border flex items-center gap-2 transition-colors ${
                              active
                                ? 'border-[#1B2A4A] bg-[#F7F6F2] text-[#1E2022] font-medium'
                                : 'border-[#ECE9E2] text-[#5C5E64] hover:border-[#1E2022]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 border border-black/15"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.colour}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizesForColour.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#1E2022]">Select Size</span>
                      {selectedVariant && (
                        <span
                          className={
                            selectedVariant.stock > 0 ? 'text-[#5C5E64]' : 'text-red-600 font-medium'
                          }
                        >
                          {selectedVariant.stock > 0
                            ? `${selectedVariant.stock} in stock`
                            : 'Out of stock'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sizesForColour.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const oos = v.stock <= 0;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={oos}
                            onClick={() => setSelectedSize(v.size)}
                            className={`min-w-[44px] h-10 px-3 text-xs font-medium border transition-colors ${
                              oos
                                ? 'border-[#ECE9E2] text-[#A8A9AE] bg-[#F7F6F2] line-through cursor-not-allowed'
                                : isSelected
                                ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                                : 'border-[#ECE9E2] text-[#1E2022] hover:border-[#1E2022]'
                            }`}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-[#ECE9E2] space-y-2.5">
                <button
                  type="button"
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  onClick={() => {
                    if (!selectedVariant) return;
                    addToCart(product, selectedVariant, 1, true);
                    setQuickViewProductId(null);
                  }}
                  className="w-full py-3 px-5 bg-[#1E2022] hover:bg-[#1B2A4A] disabled:bg-[#A8A9AE] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {selectedVariant && selectedVariant.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                  </span>
                </button>

                <Link
                  to={`/product/${product.slug}`}
                  onClick={() => setQuickViewProductId(null)}
                  className="w-full py-2.5 px-4 border border-[#ECE9E2] hover:border-[#1E2022] text-[#1E2022] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View Full Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
