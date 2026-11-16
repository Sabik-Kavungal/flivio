import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageCircle, ArrowLeft, MapPin, ShoppingBag, Info, ChevronDown, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { orderService } from '../services/orderService';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { formatINR } from '../utils/format';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  mobile: z
    .string()
    .regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid 10–15 digit mobile number'),
  whatsappNumber: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  house: z.string().min(2, 'Enter house, flat, or building name'),
  street: z.string().min(3, 'Enter street or locality'),
  city: z.string().min(2, 'Enter city or town'),
  district: z.string().min(2, 'Enter district'),
  state: z.string().min(2, 'Enter state'),
  pinCode: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  deliveryInstructions: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const cart = useStore((s) => s.cart);
  const currentCustomer = useStore((s) => s.currentCustomer);
  const clearCart = useStore((s) => s.clearCart);
  const refreshAll = useStore((s) => s.refreshAll);
  const pushToast = useStore((s) => s.pushToast);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [sameWhatsApp, setSameWhatsApp] = useState(true);

  const defaultAddress =
    currentCustomer?.addresses.find((a) => a.isDefault) ||
    currentCustomer?.addresses[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: defaultAddress?.fullName || currentCustomer?.name || '',
      mobile: defaultAddress?.mobile || currentCustomer?.mobile || '',
      whatsappNumber: defaultAddress?.mobile || currentCustomer?.mobile || '',
      email: currentCustomer?.email || '',
      house: defaultAddress?.house || '',
      street: defaultAddress?.street || '',
      city: defaultAddress?.city || '',
      district: defaultAddress?.district || '',
      state: defaultAddress?.state || '',
      pinCode: defaultAddress?.pinCode || '',
      deliveryInstructions: '',
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const watchedValues = watch();
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = cart.reduce((s, i) => s + i.quantity, 0);

  const applySavedAddress = (addrId: string) => {
    const addr = currentCustomer?.addresses.find((a) => a.id === addrId);
    if (!addr) return;
    setValue('fullName', addr.fullName);
    setValue('mobile', addr.mobile);
    setValue('whatsappNumber', addr.mobile);
    setValue('house', addr.house);
    setValue('street', addr.street);
    setValue('city', addr.city);
    setValue('district', addr.district);
    setValue('state', addr.state);
    setValue('pinCode', addr.pinCode);
    pushToast({ title: `Applied "${addr.label}" address`, type: 'info' });
  };

  const onSubmit = (data: CheckoutFormValues) => {
    setSubmitError(null);
    try {
      const resolvedWhatsApp = sameWhatsApp
        ? data.mobile.trim()
        : (data.whatsappNumber || data.mobile).trim();
      const { order } = orderService.placeOrder(
        {
          customerId: currentCustomer?.id,
          fullName: data.fullName.trim(),
          mobile: data.mobile.trim(),
          whatsappNumber: resolvedWhatsApp,
          email: data.email?.trim() || undefined,
          house: data.house.trim(),
          street: data.street.trim(),
          city: data.city.trim(),
          district: data.district.trim(),
          state: data.state.trim(),
          pinCode: data.pinCode.trim(),
          deliveryInstructions: data.deliveryInstructions?.trim() || undefined,
        },
        cart
      );

      clearCart();
      refreshAll();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to place order.';
      setSubmitError(msg);
      pushToast({ title: 'Order Error', description: msg, type: 'error' });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center">
        <ShoppingBag className="w-10 h-10 text-[#A8A9AE] mx-auto mb-3 stroke-[1.25]" />
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">
          Your bag is empty
        </h1>
        <p className="mt-2 text-sm text-[#5C5E64]">
          Add items to your shopping bag before proceeding to WhatsApp checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[75vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5E64] hover:text-[#1E2022] mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shopping Bag</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-[#1E2022]">
            WhatsApp Checkout
          </h1>
          <p className="mt-1 text-sm text-[#5C5E64]">
            Enter your delivery details below to generate your order and send it directly to FLIVIO on WhatsApp.
          </p>
        </div>
      </div>

      {/* Mobile Compact Order Summary Accordion */}
      <div className="lg:hidden border-b border-[#ECE9E2] bg-white">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((v) => !v)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-[#1E2022]"
        >
          <span className="inline-flex items-center gap-1.5 text-[#1B2A4A]">
            <span>{mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({totalCount})</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                mobileSummaryOpen ? 'rotate-180' : ''
              }`}
            />
          </span>
          <span className="text-sm font-semibold tabular-nums">{formatINR(subtotal)}</span>
        </button>

        {mobileSummaryOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#ECE9E2] pt-3 bg-[#F7F6F2]">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 aspect-[4/5] bg-white border border-[#ECE9E2] shrink-0 overflow-hidden">
                  <ResolvedImage
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1E2022] line-clamp-1">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-[#5C5E64]">
                    {item.colour} · Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-semibold tabular-nums text-[#1E2022]">
                  {formatINR(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-8">
            {currentCustomer && currentCustomer.addresses.length > 0 && (
              <div className="p-4 border border-[#ECE9E2] bg-[#F7F6F2]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#1B2A4A]" />
                  <span>Saved Delivery Addresses</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentCustomer.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr.id)}
                      className="text-left p-3 bg-white border border-[#ECE9E2] hover:border-[#1B2A4A] transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#1E2022]">
                        {addr.label} {addr.isDefault ? '· Default' : ''}
                      </p>
                      <p className="text-xs text-[#5C5E64] mt-0.5 truncate">
                        {addr.house}, {addr.street}, {addr.city} - {addr.pinCode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 border border-red-300 bg-red-50 text-xs text-red-700">
                {submitError}
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022] pb-3 border-b border-[#ECE9E2]">
                01. Customer Contact Details
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName')}
                    aria-invalid={Boolean(errors.fullName)}
                    placeholder="e.g. Ananya Sharma"
                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm border outline-none transition-colors ${
                      errors.fullName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#ECE9E2] focus:border-[#1B2A4A]'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    {...register('mobile')}
                    type="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.mobile)}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm border outline-none transition-colors ${
                      errors.mobile
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#ECE9E2] focus:border-[#1B2A4A]'
                    }`}
                  />
                  {errors.mobile ? (
                    <p className="mt-1 text-xs text-red-600">{errors.mobile.message}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#86888E]">10-digit mobile number for delivery updates</p>
                  )}
                </div>

                <div className="flex flex-col justify-start">
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    WhatsApp Updates
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-[#1E2022] py-2.5 px-3 border border-[#ECE9E2] bg-[#F7F6F2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameWhatsApp}
                      onChange={(e) => setSameWhatsApp(e.target.checked)}
                      className="accent-[#1B2A4A]"
                    />
                    <span>Same as mobile number</span>
                  </label>
                  {!sameWhatsApp && (
                    <input
                      {...register('whatsappNumber')}
                      type="tel"
                      inputMode="tel"
                      placeholder="Enter separate WhatsApp number"
                      className="mt-2 w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    aria-invalid={Boolean(errors.email)}
                    placeholder="you@example.com"
                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm border outline-none transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#ECE9E2] focus:border-[#1B2A4A]'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022] pb-3 border-b border-[#ECE9E2]">
                02. Delivery Address
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    House / Flat / Building Name *
                  </label>
                  <input
                    {...register('house')}
                    placeholder="Flat 402, Meridian Residency"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                  {errors.house && (
                    <p className="mt-1 text-xs text-red-600">{errors.house.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Street / Road / Locality *
                  </label>
                  <input
                    {...register('street')}
                    placeholder="12th Main Road, Indiranagar"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                  {errors.street && (
                    <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    District *
                  </label>
                  <input
                    {...register('district')}
                    placeholder="Bengaluru Urban"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                  {errors.district && (
                    <p className="mt-1 text-xs text-red-600">{errors.district.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    State *
                  </label>
                  <input
                    {...register('state')}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    {...register('pinCode')}
                    maxLength={6}
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.pinCode)}
                    placeholder="560038"
                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm border outline-none tabular-nums transition-colors ${
                      errors.pinCode
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#ECE9E2] focus:border-[#1B2A4A]'
                    }`}
                  />
                  {errors.pinCode ? (
                    <p className="mt-1 text-xs text-red-600">{errors.pinCode.message}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#86888E]">6-digit postal PIN code</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    {...register('deliveryInstructions')}
                    rows={2}
                    placeholder="Landmark, preferred delivery hours, or gate instructions"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Review & WhatsApp CTA */}
          <div className="lg:col-span-5">
            <div className="border border-[#ECE9E2] bg-[#F7F6F2] p-5 sm:p-6 space-y-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                Order Review ({totalCount} items)
              </h2>

              <div className="divide-y divide-[#ECE9E2] max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <div className="w-14 aspect-[4/5] bg-white border border-[#ECE9E2] shrink-0 overflow-hidden">
                      <ResolvedImage
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1E2022] line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-[#5C5E64] mt-0.5">
                        {item.colour} · Size {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-[#1E2022] shrink-0">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {(watchedValues.house || watchedValues.city) && (
                <div className="p-3 bg-white border border-[#ECE9E2] text-xs text-[#5C5E64]">
                  <p className="font-semibold text-[#1E2022] mb-1">Delivery Address Preview</p>
                  <p className="break-words">
                    {[
                      watchedValues.house,
                      watchedValues.street,
                      watchedValues.city,
                      watchedValues.district,
                      watchedValues.state,
                      watchedValues.pinCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              <div className="border-t border-[#ECE9E2] pt-4 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#1E2022]">Order Total</span>
                <span className="text-xl font-semibold tabular-nums text-[#1E2022]">
                  {formatINR(subtotal)}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#ECE9E2] flex items-start gap-2.5 text-[11px] text-[#5C5E64] leading-relaxed">
                <Info className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
                <span>
                  No online payment is collected on this step. Submitting creates your Order ID and prepares a pre-filled WhatsApp message to send directly to the FLIVIO store team.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-5 bg-[#1E2022] hover:bg-[#1B2A4A] disabled:opacity-70 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>GENERATING ORDER...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>PLACE ORDER VIA WHATSAPP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
