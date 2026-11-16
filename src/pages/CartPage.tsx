import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatINR } from '../utils/format';

export const CartPage: React.FC = () => {
  const cart = useStore((s) => s.cart);
  const updateCartQty = useStore((s) => s.updateCartQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const [confirmClear, setConfirmClear] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B2A4A]">
            FLIVIO Edit
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#1E2022]">
            Shopping Bag
          </h1>
          <p className="mt-1 text-sm text-[#5C5E64] tabular-nums">
            {totalCount} {totalCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="py-16 text-center border border-[#ECE9E2] bg-[#F7F6F2] px-6"
          >
            <ShoppingBag className="w-12 h-12 text-[#A8A9AE] stroke-[1.25] mx-auto mb-3" />
            <h2 className="text-lg font-medium text-[#1E2022]">Your shopping bag is empty</h2>
            <p className="text-sm text-[#5C5E64] mt-1 max-w-md mx-auto">
              Browse our curated essentials and add your preferred size and colour to begin.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE9E2]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E64]">
                  Selected Items
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-[#5C5E64] hover:text-red-600 underline"
                >
                  Clear Bag
                </button>
              </div>

              <div className="divide-y divide-[#ECE9E2]">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                  >
                    <div className="flex items-start gap-3.5 sm:gap-5 flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="w-20 sm:w-24 aspect-[4/5] bg-[#F7F6F2] border border-[#ECE9E2] shrink-0 overflow-hidden"
                      >
                        <ResolvedImage
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover object-top"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="text-sm sm:text-base font-medium text-[#1E2022] hover:text-[#1B2A4A] transition-colors line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5C5E64]">
                          <span>Colour: {item.colour}</span>
                          <span>·</span>
                          <span>Size: {item.size}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline font-mono text-[11px]">{item.sku}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium tabular-nums text-[#1E2022]">
                          {formatINR(item.unitPrice)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pl-0 pt-3 border-t border-[#F7F6F2] sm:border-t-0 sm:pt-0">
                      <div className="inline-flex items-center border border-[#ECE9E2] bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-[#F7F6F2] transition-colors active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 sm:w-10 text-center text-xs font-semibold tabular-nums text-[#1E2022]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => updateCartQty(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-[#F7F6F2] disabled:opacity-40 transition-colors active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <p className="text-sm font-semibold tabular-nums text-[#1E2022] min-w-[68px] text-right">
                          {formatINR(item.unitPrice * item.quantity)}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.productName}`}
                          className="p-2 text-[#86888E] hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="border border-[#ECE9E2] bg-[#F7F6F2] p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-sm border-t border-[#ECE9E2] pt-4">
                  <div className="flex justify-between text-[#5C5E64]">
                    <span>Items Subtotal ({totalCount})</span>
                    <span className="tabular-nums font-medium text-[#1E2022]">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5C5E64]">
                    <span>Shipping</span>
                    <span className="text-xs font-medium text-[#1B2A4A]">
                      {subtotal >= 999 ? 'Free Express' : 'Calculated at Dispatch'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5C5E64]">
                    <span>Order Confirmation</span>
                    <span className="text-xs font-medium text-[#1E2022]">Via WhatsApp</span>
                  </div>
                </div>

                <div className="border-t border-[#ECE9E2] pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[#1E2022]">Total</span>
                  <span className="text-xl font-semibold tabular-nums text-[#1E2022]">
                    {formatINR(subtotal)}
                  </span>
                </div>

                <p className="text-[11px] text-[#5C5E64] leading-relaxed bg-white border border-[#ECE9E2] px-3 py-2">
                  Next step: enter your delivery address and confirm your order directly on WhatsApp — no card payment required online.
                </p>

                <Link
                  to="/checkout"
                  className="w-full py-3.5 px-5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#5C5E64] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A4A]" />
                  <span>Easy 7-day exchanges · Quality checked dispatch</span>
                </div>

                <Link
                  to="/shop"
                  className="block text-center text-xs text-[#5C5E64] hover:text-[#1E2022] underline pt-1"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear Shopping Bag?"
        description="This will remove all items currently stored in your bag."
        confirmLabel="Clear Bag"
        destructive
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};
