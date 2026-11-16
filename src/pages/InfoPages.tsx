import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Instagram } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sanitizeWhatsappNumber } from '../utils/format';

interface PolicyPageProps {
  type: 'about' | 'shipping' | 'returns' | 'privacy' | 'terms';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type }) => {
  const { settings } = useStore();

  const meta = {
    about: {
      kicker: 'Our Philosophy',
      title: 'About FLIVIO',
      body: settings.aboutContent,
    },
    shipping: {
      kicker: 'Delivery & Dispatch',
      title: 'Shipping Policy',
      body: settings.shippingPolicy,
    },
    returns: {
      kicker: 'Exchanges & Support',
      title: 'Return & Refund Policy',
      body: settings.returnPolicy,
    },
    privacy: {
      kicker: 'Customer Data',
      title: 'Privacy Policy',
      body: settings.privacyPolicy,
    },
    terms: {
      kicker: 'Store Terms',
      title: 'Terms & Conditions',
      body: settings.termsAndConditions,
    },
  }[type];

  return (
    <div className="bg-white min-h-[65vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
            {meta.kicker}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1E2022]">
            {meta.title}
          </h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="prose prose-sm max-w-none text-[#5C5E64] leading-relaxed whitespace-pre-line">
          {meta.body}
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings, pushToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const waPhone = sanitizeWhatsappNumber(settings.whatsappNumber || '919744296860');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    pushToast({ title: 'Message received', description: 'For fastest response, chat on WhatsApp.', type: 'success' });
  };

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
            Customer Studio
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1E2022]">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-[#5C5E64]">
            Questions on sizing, fabrics, or an active order? Reach our team directly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        <div className="md:col-span-5 space-y-5">
          <div className="p-5 border border-[#ECE9E2] bg-[#F7F6F2] space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#1B2A4A] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">Email</p>
                <p className="text-sm text-[#5C5E64] break-all">{settings.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#1B2A4A] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">Phone</p>
                <p className="text-sm text-[#5C5E64]">{settings.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="w-4 h-4 text-[#1B2A4A] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">Instagram</p>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1B2A4A] hover:underline break-all"
                >
                  {settings.instagramUrl}
                </a>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="md:col-span-7">
          {sent ? (
            <div className="p-6 sm:p-8 border border-[#ECE9E2] bg-[#F7F6F2]">
              <h2 className="text-lg font-medium text-[#1E2022]">Inquiry Noted</h2>
              <p className="mt-2 text-sm text-[#5C5E64] leading-relaxed">
                Thank you, {name}. Your note has been recorded — for the fastest response on sizing or orders, message us directly on WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-5 px-4 py-2 border border-[#1E2022] text-xs font-semibold uppercase tracking-wider text-[#1E2022] hover:bg-[#1E2022] hover:text-white transition-colors"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-[#ECE9E2] p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1E2022] mb-1.5">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E2022] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1E2022] mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
