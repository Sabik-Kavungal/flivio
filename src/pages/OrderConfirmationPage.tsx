import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, Copy, Check, Clock, ArrowRight, Info } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useStore } from '../store/useStore';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { formatDateTime, formatINR } from '../utils/format';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { refreshAll, pushToast } = useStore();
  const [copied, setCopied] = useState(false);

  const order = orderId ? orderService.getById(orderId) : undefined;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#1E2022]">
          Order Not Found
        </h1>
        <p className="mt-2 text-sm text-[#5C5E64]">
          We could not find order {orderId} on this device.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  const whatsappUrl = orderService.buildWhatsappUrl(order.whatsappMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.whatsappMessage);
      setCopied(true);
      pushToast({ title: 'Order details copied', type: 'success' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      pushToast({ title: 'Unable to copy automatically', type: 'error' });
    }
  };

  const handleLaunchWhatsapp = () => {
    orderService.markWhatsappLaunched(order.id);
    refreshAll();
  };

  return (
    <div className="bg-white min-h-[75vh] py-8 sm:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="border border-[#ECE9E2] bg-[#F7F6F2] p-5 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {order.whatsappLaunched
                    ? 'Order Created · WhatsApp Opened'
                    : 'Order Saved · Pending WhatsApp Send'}
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022] break-words">
                Order {order.id}
              </h1>
              <p className="mt-1 text-xs text-[#5C5E64] tabular-nums">
                Created on {formatDateTime(order.createdAt)} · Status: {order.status}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wider text-[#5C5E64]">Order Total</p>
              <p className="text-2xl font-semibold tabular-nums text-[#1E2022]">
                {formatINR(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Primary WhatsApp Send Step */}
          <div className="mt-6 p-4 sm:p-5 bg-white border border-[#ECE9E2] space-y-4">
            <h2 className="text-sm font-semibold text-[#1E2022]">
              Final Step: Send Your Order to FLIVIO on WhatsApp
            </h2>
            <p className="text-xs text-[#5C5E64] leading-relaxed">
              Your order is saved under ID <strong className="font-mono text-[#1E2022]">{order.id}</strong>. Tap the button below to open WhatsApp with your complete itemized order message and send it to our store team for confirmation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLaunchWhatsapp}
                className="flex-1 py-3.5 px-5 bg-[#1B2A4A] hover:bg-[#111C33] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp &amp; Send Order</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="py-3.5 px-5 border border-[#ECE9E2] hover:border-[#1E2022] text-[#1E2022] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                {copied ? <Check className="w-4 h-4 text-[#1B2A4A]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Order Text'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-start gap-2 text-[11px] text-[#5C5E64]">
              <Info className="w-3.5 h-3.5 text-[#5C5E64] shrink-0 mt-0.5" />
              <span>
                WhatsApp links include product links and item details automatically. You can attach product photos manually in your WhatsApp chat if needed.
              </span>
            </div>
          </div>

          {/* Message Preview */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5E64] mb-2">
              WhatsApp Message Preview
            </p>
            <pre className="p-4 bg-white border border-[#ECE9E2] text-xs font-mono text-[#1E2022] whitespace-pre-wrap break-words leading-relaxed max-h-60 overflow-y-auto">
              {order.whatsappMessage}
            </pre>
          </div>

          {/* Ordered Items */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5E64] mb-3">
              Items in This Order
            </p>
            <div className="bg-white border border-[#ECE9E2] divide-y divide-[#ECE9E2]">
              {order.items.map((item) => (
                <div key={`${item.productId}_${item.variantId}`} className="p-3.5 flex items-center gap-3.5 sm:gap-4">
                  <div className="w-14 aspect-[4/5] bg-[#F7F6F2] border border-[#ECE9E2] shrink-0 overflow-hidden">
                    <ResolvedImage
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E2022] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#5C5E64] mt-0.5 break-words">
                      {item.colour} · Size {item.size} · Qty {item.quantity} ·{' '}
                      <span className="font-mono text-[11px]">{item.sku}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-[#1E2022] shrink-0">
                    {formatINR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ECE9E2]">
            <Link
              to={`/account/orders/${order.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:text-[#1B2A4A] transition-colors"
            >
              View Order Receipt
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
