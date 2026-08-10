import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthProvider';
import Navbar from './Navbar';
import Footer from './Footer';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiMapPin, FiHome, FiBriefcase } from 'react-icons/fi';

const stripePromise = loadStripe('pk_test_51SNo5JPgn4fVebeOZnUCBFWEsyv6ftDkye4mQqPxesrGRmSBe4gVxFziKgUvnUqT3Lgfufvj6Jh8ARC1ACklfq7E00AXOuhdaN');

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '400',
      letterSpacing: '0.025em',
      '::placeholder': { color: '#d1d5db' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

const LABELS = ["Home", "Work", "Other"];

const emptyForm = { label: "Home", street: "", city: "", state: "", zip: "", country: "IN", isDefault: false };

// ── Label icon ──────────────────────────────────────────────────────────
function LabelIcon({ label }) {
  if (label === "Work") return <FiBriefcase size={14} />;
  if (label === "Home") return <FiHome size={14} />;
  return <FiMapPin size={14} />;
}

// ── Address Form Modal ──────────────────────────────────────────────────
function AddressFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.state || !form.zip || !form.country) {
      toast.error("Please fill all address fields.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          {initial?._id ? "Edit Address" : "Add New Address"}
        </h3>

        <form onSubmit={submit} className="space-y-3">
          {/* Label selector */}
          <div className="flex gap-2">
            {LABELS.map(l => (
              <button
                key={l} type="button"
                onClick={() => setForm(f => ({ ...f, label: l }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                  ${form.label === l
                    ? "bg-pink-500 text-white border-pink-500"
                    : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-pink-400"
                  }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Fields */}
          {[
            { name: "street", placeholder: "Street / House No." },
            { name: "city",   placeholder: "City" },
            { name: "state",  placeholder: "State / Province" },
            { name: "zip",    placeholder: "ZIP / Postal Code" },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handle}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600
                         bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          ))}

          <select
            name="country"
            value={form.country}
            onChange={handle}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600
                       bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Set as default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="accent-pink-500 w-4 h-4"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stripe Checkout Form ────────────────────────────────────────────────
const CheckoutForm = ({ userId, address }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('card'); // 'card' | 'upi'
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  useEffect(() => {
    if (!address?.country) return;
    const createIntent = async () => {
      try {
        const res = await axios.post(`${API_URL}/order/payment-intents`, { userId, address });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error('Payment intent error:', err);
      }
    };
    createIntent();
  }, [userId, address]);

  // ── Card payment ──
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!address?.country) { toast.error("Please select a delivery address first."); return; }
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          address: {
            line1: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.zip,
            country: address.country,
          },
        },
      },
    });

    if (error) { setLoading(false); toast.error('Payment failed: ' + error.message); return; }

    try {
      const res = await axios.post(`${API_URL}/order/create`, {
        userId, address, paymentIntentId: paymentIntent.id,
      });
      if (res.status === 201) {
        toast.success('Order placed successfully!');
        setTimeout(() => { window.location.href = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/success?orderId=${res.data._id}`; }, 1500);
      }
    } catch (err) {
      toast.error('Failed to place order: ' + err.message);
      setLoading(false);
    }
  };

  // ── UPI payment ──
  const validateUpi = (id) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id);

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!address?.country) { toast.error("Please select a delivery address first."); return; }
    if (!validateUpi(upiId)) { setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiError('');
    setLoading(true);

    try {
      // Simulate UPI approval step
      toast('📱 Simulating UPI approval...', { icon: '⏳', duration: 2000 });
      await new Promise(r => setTimeout(r, 2000)); // simulate network delay

      const res = await axios.post(`${API_URL}/order/create-upi`, {
        userId, address, upiId,
      });

      if (res.status === 201) {
        toast.success('Payment successful! Order placed via UPI.');
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/success?orderId=${res.data._id}`;
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'UPI payment failed.');
      setLoading(false);
    }
  };

  const canPay = !!stripe && !!clientSecret && !!address?.country;

  return (
    <div>
      {/* ── Method selector ── */}
      <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600 mb-6">
        {[
          { id: 'card', label: 'Credit / Debit Card', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M6 15h4" strokeLinecap="round"/>
            </svg>
          )},
          { id: 'upi', label: 'UPI', icon: (
            <img src="./public/logo/upi.png"
              alt="UPI" className="h-5 w-auto object-contain" />
          )},
        ].map((m, i) => (
          <button key={m.id} type="button" onClick={() => setPayMethod(m.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-all duration-200
              ${i === 0 ? '' : 'border-l border-gray-200 dark:border-slate-600'}
              ${payMethod === m.id
                ? 'bg-pink-500 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}>
            <span className={payMethod === m.id ? 'text-white' : 'text-gray-400'}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Card form ── */}
      {payMethod === 'card' && (
        <form onSubmit={handleCardSubmit} className="space-y-5">
          {/* Card number field */}
          <div className="group">
            <label className="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Card Information
            </label>
            <div className="relative border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 overflow-hidden
              focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-50 dark:focus-within:ring-pink-900/20 transition-all duration-200">
              {/* Card brand icons */}
              <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-1">
                {['visa','mc','amex','rupay'].map(b => (
                  <div key={b} className="h-5 w-8 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center">
                    <span className="text-[7px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tight">
                      {b === 'mc' ? 'MC' : b === 'amex' ? 'AMEX' : b === 'rupay' ? 'RP' : 'VISA'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-2">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>

          {/* Test hint */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <span className="text-sm">🧪</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Test mode</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                4242 4242 4242 4242 · 12/26 · 123
              </p>
            </div>
          </div>

          {/* Pay button */}
          <button type="submit" disabled={!canPay || loading}
            className={`w-full relative overflow-hidden py-4 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-300
              ${!canPay || loading
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 dark:shadow-pink-900/30 active:scale-[0.98]'
              }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing payment…
              </span>
            ) : !address?.country ? (
              'Select a delivery address first'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round"/>
                </svg>
                Pay securely
              </span>
            )}
          </button>
        </form>
      )}

      {/* ── UPI form ── */}
      {payMethod === 'upi' && (
        <form onSubmit={handleUpiSubmit} className="space-y-5">
          {/* UPI ID input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              UPI ID
            </label>
            <div className={`flex items-center border rounded-xl bg-white dark:bg-slate-800 overflow-hidden transition-all duration-200
              ${upiError
                ? 'border-red-400 ring-4 ring-red-50 dark:ring-red-900/20'
                : 'border-gray-200 dark:border-slate-600 focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-50 dark:focus-within:ring-pink-900/20'
              }`}>
              <div className="pl-4 pr-2 text-gray-300 dark:text-slate-600 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M12 8v4l3 3" strokeLinecap="round"/>
                </svg>
              </div>
              <input type="text" value={upiId}
                onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                placeholder="yourname@upi"
                className="flex-1 py-4 pr-4 text-sm bg-transparent text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none"
              />
            </div>
            {upiError
              ? <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span>{upiError}</p>
              : <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">e.g. name@okaxis · number@paytm · phone@ybl</p>
            }
          </div>

          {/* App pills */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Accepted apps</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { name: 'GPay',    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png' },
                { name: 'PhonePe', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/800px-PhonePe_Logo.png' },
                { name: 'Paytm',   src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png' },
                { name: 'BHIM',    src: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/BHIM_logo.png/220px-BHIM_logo.png' },
              ].map(app => (
                <div key={app.name}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm">
                  <img src={app.src} alt={app.name} className="h-4 w-auto object-contain"
                    onError={e => { e.target.style.display='none'; }} />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{app.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40">
            <span className="text-base mt-0.5 shrink-0">📱</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              A payment request will be sent to your UPI app. Open the app and approve within 2 minutes.
            </p>
          </div>

          {/* Pay button */}
          <button type="submit" disabled={loading || !upiId || !address?.country}
            className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-300
              ${loading || !upiId || !address?.country
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 dark:shadow-pink-900/30 active:scale-[0.98]'
              }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Waiting for approval…
              </span>
            ) : !address?.country ? 'Select a delivery address first' : 'Pay with UPI'}
          </button>
        </form>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span className="text-[11px] text-gray-300 dark:text-slate-600 tracking-wide">
          256-bit SSL · Secured by Stripe
        </span>
      </div>
    </div>
  );
};

// ── Main Payment Page ───────────────────────────────────────────────────
const Payment = () => {
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user._id : null;

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(true);

  // Fetch saved addresses
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      setLoadingAddr(true);
      try {
        const res = await axios.get(`${API_URL}/user/addresses/${userId}`);
        setAddresses(res.data.addresses || []);
        const def = res.data.addresses?.find(a => a.isDefault);
        if (def) setSelectedId(def._id);
        else if (res.data.addresses?.length > 0) setSelectedId(res.data.addresses[0]._id);
      } catch {
        setAddresses([]);
      } finally {
        setLoadingAddr(false);
      }
    };
    fetch();
  }, [userId]);

  const selectedAddress = addresses.find(a => a._id === selectedId) || null;

  const handleSaveAddress = async (form) => {
    try {
      if (editingAddr?._id) {
        const res = await axios.put(
          `${API_URL}/user/addresses/${userId}/${editingAddr._id}`, form
        );
        setAddresses(res.data.addresses);
        toast.success("Address updated!");
      } else {
        const res = await axios.post(`${API_URL}/user/addresses/${userId}`, form);
        setAddresses(res.data.addresses);
        const newAddr = res.data.addresses[res.data.addresses.length - 1];
        setSelectedId(newAddr._id);
        toast.success("Address added!");
      }
      setShowModal(false);
      setEditingAddr(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address.");
    }
  };

  const handleDelete = async (addrId) => {
    try {
      const res = await axios.delete(`${API_URL}/user/addresses/${userId}/${addrId}`);
      setAddresses(res.data.addresses);
      if (selectedId === addrId) {
        const def = res.data.addresses.find(a => a.isDefault);
        setSelectedId(def?._id || res.data.addresses[0]?._id || null);
      }
      toast.success("Address removed.");
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const res = await axios.put(`${API_URL}/user/addresses/${userId}/${addrId}/default`);
      setAddresses(res.data.addresses);
      setSelectedId(addrId);
    } catch {
      toast.error("Failed to set default.");
    }
  };

  return (
    <>
      <Navbar />

      {showModal && (
        <AddressFormModal
          initial={editingAddr}
          onSave={handleSaveAddress}
          onClose={() => { setShowModal(false); setEditingAddr(null); }}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── LEFT: Address Section ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-pink-500" /> Delivery Address
                </h2>
                <button
                  onClick={() => { setEditingAddr(null); setShowModal(true); }}
                  className="flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-600 font-medium"
                >
                  <FiPlus size={16} /> Add New
                </button>
              </div>

              {loadingAddr ? (
                <div className="text-center py-10 text-gray-400">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 p-8 text-center">
                  <FiMapPin size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No saved addresses</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Add an address to continue</p>
                  <button
                    onClick={() => { setEditingAddr(null); setShowModal(true); }}
                    className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    + Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedId(addr._id)}
                      className={`relative bg-white dark:bg-slate-800 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200
                        ${selectedId === addr._id
                          ? "border-pink-500 shadow-md shadow-pink-100 dark:shadow-none"
                          : "border-gray-200 dark:border-slate-700 hover:border-pink-300"
                        }`}
                    >
                      {/* Selected indicator */}
                      {selectedId === addr._id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <FiCheck size={13} className="text-white" />
                        </div>
                      )}

                      {/* Label + Default badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-2.5 py-1 rounded-full">
                          <LabelIcon label={addr.label} />
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Address text */}
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {addr.street}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {addr.city}, {addr.state} - {addr.zip}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {COUNTRIES.find(c => c.code === addr.country)?.name || addr.country}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                        <button
                          onClick={e => { e.stopPropagation(); setEditingAddr(addr); setShowModal(true); }}
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSetDefault(addr._id); }}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            <FiCheck size={12} /> Set Default
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(addr._id); }}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium ml-auto"
                        >
                          <FiTrash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected address summary */}
              {selectedAddress && (
                <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                  <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1">
                    Delivering to:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Payment Section ── */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                💳 Payment
              </h2>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                <Elements stripe={stripePromise}>
                  <CheckoutForm userId={userId} address={selectedAddress} />
                </Elements>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Payment;
