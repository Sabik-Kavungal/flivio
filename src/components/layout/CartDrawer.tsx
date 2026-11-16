import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { formatINR } from '../../utils/format';
import { ResolvedImage } from '../common/ResolvedImage';

export const CartDrawer: React.FC = () => {
  const cart = useStore((s) => s.cart);
  const isCartDrawerOpen = useStore((s) => s.isCartDrawerOpen);
  const setCartDrawerOpen = useStore((s) => s.setCartDrawerOpen);
  const updateCartQty = useStore((s) => s.updateCartQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isCartDrawerOpen, setCartDrawerOpen]);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setCartDrawerOpen(false)}
          />
          <motion.aside
            aria-label="Shopping Bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
          >
            <div className="px-5 h-16 border-b border-[#ECE9E2] flex items-center justify-between bg-[#F7F6F2]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#1E2022]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Shopping Bag ({totalCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close shopping bag"
                className="p-2 -mr-2 text-[#5C5E64] hover:text-[#1E2022]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="w-10 h-10 text-[#A8A9AE] stroke-[1.25] mb-3" />
                  <p className="text-sm font-medium text-[#1E2022]">Your bag is empty</p>
                  <p className="text-xs text-[#5C5E64] mt-1 max-w-xs">
                    Explore our embroidered layered tops, Korean puff tops, floral blouses, and cotton short kurtis.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      navigate('/women');
                    }}
                    className="mt-5 px-5 py-2.5 bg-[#1E2022] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1B2A4A] transition-colors active:scale-[0.98]"
                  >
                    Explore Women&apos;s Collection
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#ECE9E2]">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-3.5 sm:gap-4">
                      <Link
                        to={`/product/${item.productSlug}`}
                        onClick={() => setCartDrawerOpen(false)}
                        className="w-20 aspect-[4/5] bg-[#F7F6F2] shrink-0 overflow-hidden border border-[#ECE9E2]"
                      >
                        <ResolvedImage
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover object-top"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/product/${item.productSlug}`}
                              onClick={() => setCartDrawerOpen(false)}
                              className="text-sm font-medium text-[#1E2022] hover:text-[#1B2A4A] line-clamp-1"
                            >
                              {item.productName}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={`Remove ${item.productName}`}
                              className="text-[#86888E] hover:text-red-600 p-0.5 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#5C5E64] mt-0.5">
                            {item.colour} · Size {item.size}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-[#ECE9E2]">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 flex items-center justify-center text-[#1E2022] hover:bg-[#F7F6F2] active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={item.quantity >= item.maxStock}
                              onClick={() => updateCartQty(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-8 h-8 flex items-center justify-center text-[#1E2022] hover:bg-[#F7F6F2] disabled:opacity-40 active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-[#1E2022]">
                            {formatINR(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#ECE9E2] bg-[#F7F6F2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#5C5E64]">Subtotal</span>
                  <span className="text-base font-semibold tabular-nums text-[#1E2022]">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#5C5E64]">
                  Order placed directly via WhatsApp. Shipping &amp; confirmation handled on WhatsApp.
                </p>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    to="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    className="py-3 px-4 border border-[#1E2022] text-[#1E2022] text-xs font-semibold uppercase tracking-wider text-center hover:bg-white transition-colors active:scale-[0.98]"
                  >
                    View Bag
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    className="py-3 px-4 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
