import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { User, MapPin, Package, LogOut, Plus, Trash2, Check, ArrowLeft, Edit2, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';
import { Address } from '../types';
import { ResolvedImage } from '../components/common/ResolvedImage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatDate, formatDateTime, formatINR } from '../utils/format';

export const AccountPage: React.FC<{ initialTab?: 'profile' | 'addresses' | 'orders' }> = ({
  initialTab = 'profile',
}) => {
  const currentCustomer = useStore((s) => s.currentCustomer);
  const setCurrentCustomer = useStore((s) => s.setCurrentCustomer);
  const orders = useStore((s) => s.orders);
  const pushToast = useStore((s) => s.pushToast);
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'addresses' | 'orders'>(initialTab);
  const [pendingDeleteAddr, setPendingDeleteAddr] = useState<Address | null>(null);

  // Profile state
  const [name, setName] = useState(currentCustomer?.name || '');
  const [mobile, setMobile] = useState(currentCustomer?.mobile || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Address form state
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  if (!currentCustomer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <User className="w-10 h-10 text-[#A8A9AE] mx-auto mb-3 stroke-[1.25]" />
        <h1 className="font-display text-3xl font-semibold text-[#1E2022]">
          Sign in to View Your Account
        </h1>
        <p className="mt-2 text-sm text-[#5C5E64]">
          Manage your profile, delivery addresses, and order history.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border border-[#1E2022] text-[#1E2022] hover:border-[#1B2A4A] hover:text-[#1B2A4A] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const customerOrders = orders.filter(
    (o) =>
      o.customer.customerId === currentCustomer.id ||
      o.customer.email?.toLowerCase() === currentCustomer.email.toLowerCase() ||
      o.customer.mobile === currentCustomer.mobile
  );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = customerService.updateProfile(currentCustomer.id, {
        name,
        mobile,
        email,
      });
      setCurrentCustomer(updated);
      pushToast({ title: 'Profile updated', type: 'success' });
    } catch (err) {
      pushToast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to save',
        type: 'error',
      });
    }
  };

  const openNewAddressForm = () => {
    setEditingAddrId(null);
    setAddrLabel('Home');
    setAddrFullName(currentCustomer.name);
    setAddrMobile(currentCustomer.mobile);
    setAddrHouse('');
    setAddrStreet('');
    setAddrCity('');
    setAddrDistrict('');
    setAddrState('');
    setAddrPin('');
    setAddrDefault(currentCustomer.addresses.length === 0);
    setAddrFormOpen(true);
  };

  const openEditAddressForm = (addr: Address) => {
    setEditingAddrId(addr.id);
    setAddrLabel(addr.label);
    setAddrFullName(addr.fullName);
    setAddrMobile(addr.mobile);
    setAddrHouse(addr.house);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrDistrict(addr.district);
    setAddrState(addr.state);
    setAddrPin(addr.pinCode);
    setAddrDefault(addr.isDefault);
    setAddrFormOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      label: addrLabel,
      fullName: addrFullName,
      mobile: addrMobile,
      house: addrHouse,
      street: addrStreet,
      city: addrCity,
      district: addrDistrict,
      state: addrState,
      pinCode: addrPin,
      isDefault: addrDefault,
    };
    const updated = editingAddrId
      ? customerService.updateAddress(currentCustomer.id, editingAddrId, payload)
      : customerService.addAddress(currentCustomer.id, payload);
    setCurrentCustomer(updated);
    setAddrFormOpen(false);
    pushToast({ title: editingAddrId ? 'Address updated' : 'Address added', type: 'success' });
  };

  const handleLogout = () => {
    customerService.logout();
    setCurrentCustomer(null);
    pushToast({ title: 'Signed out', type: 'info' });
    navigate('/');
  };

  return (
    <div className="bg-white min-h-[75vh]">
      <div className="border-b border-[#ECE9E2] bg-[#F7F6F2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
              My FLIVIO Account
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#1E2022]">
              {currentCustomer.name}
            </h1>
            <p className="mt-1 text-xs text-[#5C5E64] break-all">{currentCustomer.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#ECE9E2] bg-white hover:border-[#1E2022] text-xs font-medium text-[#1E2022] self-start sm:self-auto transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Mobile Horizontal Tabs / Desktop Sidebar Tabs */}
        <aside
          role="tablist"
          aria-label="Account sections"
          className="lg:col-span-3 w-full flex lg:flex-col overflow-x-auto no-scrollbar border-b lg:border-b-0 border-[#ECE9E2] pb-3 lg:pb-0 gap-2 lg:gap-1"
        >
          {[
            { id: 'profile', label: 'Profile & Security', icon: User },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
            { id: 'orders', label: `Order History (${customerOrders.length})`, icon: Package },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`shrink-0 lg:w-full px-3.5 sm:px-4 py-2.5 lg:py-3 text-left text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-colors ${
                tab === item.id
                  ? 'border-[#1B2A4A] bg-[#F7F6F2] text-[#1B2A4A]'
                  : 'border-[#ECE9E2] lg:border-transparent text-[#5C5E64] hover:bg-[#F7F6F2] hover:text-[#1E2022]'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
          {tab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 max-w-xl"
            >
              <form onSubmit={handleProfileSave} className="border border-[#ECE9E2] p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Personal Information
                </h2>
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </form>

              <div className="border border-[#ECE9E2] p-5 sm:p-6 space-y-4 bg-[#F7F6F2]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Password Preferences
                </h2>
                <p className="text-xs text-[#5C5E64] leading-relaxed">
                  Your account session is remembered locally on this browser for fast checkout and order tracking.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-3.5 pr-10 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C5E64] hover:text-[#1B2A4A]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPassword || newPassword.length < 6) {
                        pushToast({ title: 'Enter at least 6 characters', type: 'error' });
                        return;
                      }
                      setNewPassword('');
                      pushToast({ title: 'Password updated', type: 'success' });
                    }}
                    className="px-5 py-2.5 border border-[#1E2022] text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2022] hover:text-white transition-colors shrink-0 active:scale-[0.98]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                  Saved Addresses
                </h2>
                <button
                  type="button"
                  onClick={openNewAddressForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {addrFormOpen && (
                <form
                  onSubmit={handleSaveAddress}
                  className="border border-[#ECE9E2] bg-[#F7F6F2] p-5 sm:p-6 space-y-4"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                    {editingAddrId ? 'Edit Address' : 'New Delivery Address'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Label (Home / Office)"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      placeholder="Recipient Full Name"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      type="tel"
                      value={addrMobile}
                      onChange={(e) => setAddrMobile(e.target.value)}
                      placeholder="Mobile Number"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrHouse}
                      onChange={(e) => setAddrHouse(e.target.value)}
                      placeholder="House / Building"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="Street / Locality"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      placeholder="District"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      placeholder="State"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <input
                      required
                      inputMode="numeric"
                      value={addrPin}
                      onChange={(e) => setAddrPin(e.target.value)}
                      placeholder="PIN Code"
                      className="px-3.5 py-2.5 text-base sm:text-sm border border-[#ECE9E2] bg-white focus:border-[#1B2A4A] outline-none"
                    />
                    <label className="flex items-center gap-2 text-xs text-[#1E2022] py-1">
                      <input
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                        className="accent-[#1B2A4A]"
                      />
                      <span>Set as default delivery address</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddrFormOpen(false)}
                      className="px-5 py-2.5 border border-[#ECE9E2] bg-white text-xs font-medium text-[#1E2022]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {currentCustomer.addresses.length === 0 ? (
                <div className="p-8 border border-[#ECE9E2] bg-[#F7F6F2] text-center text-sm text-[#5C5E64]">
                  No delivery addresses saved yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCustomer.addresses.map((addr) => (
                    <div key={addr.id} className="border border-[#ECE9E2] p-5 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E2022]">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[11px] font-semibold text-[#1B2A4A]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-[#1E2022]">{addr.fullName}</p>
                        <p className="text-xs text-[#5C5E64] mt-1 leading-relaxed">
                          {addr.house}, {addr.street}, {addr.city}, {addr.district}, {addr.state} -{' '}
                          {addr.pinCode}
                        </p>
                        <p className="text-xs text-[#5C5E64] mt-1">Mobile: {addr.mobile}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F7F6F2] flex flex-wrap items-center gap-3 text-xs">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = customerService.setDefaultAddress(
                                currentCustomer.id,
                                addr.id
                              );
                              setCurrentCustomer(updated);
                              pushToast({ title: 'Default address updated', type: 'info' });
                            }}
                            className="inline-flex items-center gap-1 text-[#1B2A4A] font-medium hover:underline"
                          >
                            <Check className="w-3 h-3" />
                            <span>Set Default</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditAddressForm(addr)}
                          className="inline-flex items-center gap-1 text-[#5C5E64] hover:text-[#1E2022]"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteAddr(addr)}
                          className="inline-flex items-center gap-1 text-[#5C5E64] hover:text-red-600 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E2022]">
                My Orders
              </h2>
              {customerOrders.length === 0 ? (
                <div className="p-10 border border-[#ECE9E2] bg-[#F7F6F2] text-center">
                  <p className="text-sm text-[#5C5E64]">You haven't placed any orders yet.</p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block px-5 py-2.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-[#ECE9E2] p-4 sm:p-5 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F7F6F2]">
                        <div>
                          <span className="font-mono text-sm font-semibold text-[#1E2022]">
                            {order.id}
                          </span>
                          <span className="mx-2 text-[#86888E]">·</span>
                          <span className="text-xs text-[#5C5E64] tabular-nums">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-semibold text-[#1B2A4A]">
                            {order.status}
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-[#1E2022]">
                            {formatINR(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={`${item.productId}_${item.variantId}`}
                              className="w-12 aspect-[4/5] bg-[#F7F6F2] border border-[#ECE9E2] overflow-hidden"
                            >
                              <ResolvedImage
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          ))}
                          <span className="text-xs text-[#5C5E64]">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                          </span>
                        </div>

                        <Link
                          to={`/account/orders/${order.id}`}
                          className="px-4 py-2 border border-[#1E2022] text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2022] hover:text-white transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingDeleteAddr)}
        title="Delete Saved Address?"
        description={
          pendingDeleteAddr
            ? `Remove "${pendingDeleteAddr.label}" (${pendingDeleteAddr.house}, ${pendingDeleteAddr.city}) from your saved delivery addresses?`
            : ''
        }
        confirmLabel="Delete Address"
        destructive
        onConfirm={() => {
          if (!pendingDeleteAddr) return;
          const updated = customerService.deleteAddress(
            currentCustomer.id,
            pendingDeleteAddr.id
          );
          setCurrentCustomer(updated);
          setPendingDeleteAddr(null);
          pushToast({ title: 'Address deleted', type: 'info' });
        }}
        onCancel={() => setPendingDeleteAddr(null)}
      />
    </div>
  );
};

export const CustomerOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? orderService.getById(orderId) : undefined;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-[#1E2022]">Order Not Found</h1>
        <Link to="/account/orders" className="mt-4 inline-block text-xs text-[#1B2A4A] underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 sm:py-10 lg:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#5C5E64] hover:text-[#1E2022]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>

        <div className="border border-[#ECE9E2] p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#ECE9E2]">
            <div>
              <h1 className="font-mono text-xl sm:text-2xl font-semibold text-[#1E2022]">
                {order.id}
              </h1>
              <p className="text-xs text-[#5C5E64] mt-1 tabular-nums">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
                Status: {order.status}
              </span>
              <p className="text-xl font-semibold tabular-nums text-[#1E2022] mt-1">
                {formatINR(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#5C5E64]">
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Customer
              </p>
              <p className="text-sm text-[#1E2022] font-medium">{order.customer.fullName}</p>
              <p>Mobile: {order.customer.mobile}</p>
              <p>WhatsApp: {order.customer.whatsappNumber}</p>
              {order.customer.email && <p className="break-all">Email: {order.customer.email}</p>}
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1E2022] mb-1.5">
                Delivery Address
              </p>
              <p className="leading-relaxed break-words">
                {order.customer.house}, {order.customer.street}, {order.customer.city},{' '}
                {order.customer.district}, {order.customer.state} — PIN {order.customer.pinCode}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1E2022] mb-3">
              Ordered Items
            </p>
            <div className="divide-y divide-[#ECE9E2] border border-[#ECE9E2]">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}_${item.variantId}`}
                  className="p-3.5 flex items-center gap-3.5 sm:gap-4"
                >
                  <div className="w-14 aspect-[4/5] bg-[#F7F6F2] border border-[#ECE9E2] shrink-0 overflow-hidden">
                    <ResolvedImage
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="text-sm font-medium text-[#1E2022] hover:text-[#1B2A4A] line-clamp-1"
                    >
                      {item.productName}
                    </Link>
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
        </div>
      </div>
    </div>
  );
};
