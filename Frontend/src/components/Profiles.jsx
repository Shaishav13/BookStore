import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiUser, FiMail, FiLock, FiEdit2, FiLogOut,
  FiShoppingBag, FiMapPin, FiPlus, FiTrash2, FiCheck,
  FiHome, FiBriefcase,
} from "react-icons/fi";

// ── Shared constants ────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "IN", name: "India" }, { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" }, { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" }, { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }, { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" }, { code: "AE", name: "United Arab Emirates" },
];
const LABELS = ["Home", "Work", "Other"];
const emptyForm = { label: "Home", street: "", city: "", state: "", zip: "", country: "IN", isDefault: false };

function LabelIcon({ label }) {
  if (label === "Work") return <FiBriefcase size={13} />;
  if (label === "Home") return <FiHome size={13} />;
  return <FiMapPin size={13} />;
}

// ── Address Form Modal ──────────────────────────────────────────────────
function AddressFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.state || !form.zip || !form.country) {
      toast.error("Please fill all address fields."); return;
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
              <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                  ${form.label === l ? "bg-pink-500 text-white border-pink-500" : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-pink-400"}`}>
                {l}
              </button>
            ))}
          </div>
          {[
            { name: "street", placeholder: "Street / House No." },
            { name: "city",   placeholder: "City" },
            { name: "state",  placeholder: "State / Province" },
            { name: "zip",    placeholder: "ZIP / Postal Code" },
          ].map(({ name, placeholder }) => (
            <input key={name} name={name} value={form[name]} onChange={handle} placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600
                         bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          ))}
          <select name="country" value={form.country} onChange={handle}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600
                       bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-pink-500">
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="accent-pink-500 w-4 h-4" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Set as default address</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all disabled:opacity-60">
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Profile Component ──────────────────────────────────────────────
function Profile() {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = user?._id;

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // ── Profile state ──
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password state ──
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Orders state ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ── Addresses state ──
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  // Fetch orders on tab switch
  useEffect(() => {
    if (activeTab !== "orders") return;
    setOrdersLoading(true);
    axios.get(`http://localhost:4001/order/view/${userId}`)
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab, userId]);

  // Fetch addresses on tab switch
  useEffect(() => {
    if (activeTab !== "addresses") return;
    setAddrLoading(true);
    axios.get(`http://localhost:4001/user/addresses/${userId}`)
      .then(r => setAddresses(r.data.addresses || []))
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  }, [activeTab, userId]);

  // ── Handlers ──

  const handleProfileSave = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) { toast.error("Name and email cannot be empty."); return; }
    setProfileLoading(true);
    try {
      const res = await axios.put(`http://localhost:4001/user/profile/${userId}`, profileData);
      const updated = { ...user, name: res.data.user.name, email: res.data.user.email };
      localStorage.setItem("Users", JSON.stringify(updated));
      setAuthUser(updated);
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (passwordData.newPassword.length < 6) { toast.error("Min 6 characters."); return; }
    setPasswordLoading(true);
    try {
      await axios.put(`http://localhost:4001/user/change-password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally { setPasswordLoading(false); }
  };

  const handleSaveAddress = async (form) => {
    try {
      if (editingAddr?._id) {
        const res = await axios.put(`http://localhost:4001/user/addresses/${userId}/${editingAddr._id}`, form);
        setAddresses(res.data.addresses);
        toast.success("Address updated!");
      } else {
        const res = await axios.post(`http://localhost:4001/user/addresses/${userId}`, form);
        setAddresses(res.data.addresses);
        toast.success("Address added!");
      }
      setShowAddrModal(false);
      setEditingAddr(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address.");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await axios.delete(`http://localhost:4001/user/addresses/${userId}/${addrId}`);
      setAddresses(res.data.addresses);
      toast.success("Address removed.");
    } catch { toast.error("Failed to delete address."); }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const res = await axios.put(`http://localhost:4001/user/addresses/${userId}/${addrId}/default`);
      setAddresses(res.data.addresses);
      toast.success("Default address updated.");
    } catch { toast.error("Failed to set default."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("Users");
    setAuthUser(undefined);
    toast.success("Logged out!");
    setTimeout(() => navigate("/"), 800);
  };

  const initials = (user?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB");

  const TABS = [
    { key: "profile",   label: "Edit Profile",   icon: <FiEdit2 size={15} /> },
    { key: "addresses", label: "Addresses",       icon: <FiMapPin size={15} /> },
    { key: "orders",    label: "My Orders",       icon: <FiShoppingBag size={15} /> },
  ];

  return (
    <>
      <Navbar />

      {showAddrModal && (
        <AddressFormModal
          initial={editingAddr}
          onSave={handleSaveAddress}
          onClose={() => { setShowAddrModal(false); setEditingAddr(null); }}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white pt-28 pb-16 px-4 transition-all duration-300">
        <div className="max-w-4xl mx-auto">

          {/* ── Header Card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 text-xs rounded-full font-medium">Member</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
              <FiLogOut size={16} /> Logout
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm">
            {TABS.map(tab => (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key); setEditMode(false); navigate(`/profile?tab=${tab.key}`); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key ? "bg-pink-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"}`}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-8">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiUser className="text-pink-500" /> Profile Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                    {editMode ? (
                      <input type="text" value={profileData.name}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <FiUser className="text-gray-400" />
                        <span className="text-gray-800 dark:text-white">{user?.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                    {editMode ? (
                      <input type="email" value={profileData.email}
                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <FiMail className="text-gray-400" />
                        <span className="text-gray-800 dark:text-white">{user?.email}</span>
                      </div>
                    )}
                  </div>
                  {!editMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Member Since</label>
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700">
                        <span className="text-gray-800 dark:text-white">{user?.date ? formatDate(user.date) : "—"}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  {editMode ? (
                    <>
                      <button onClick={handleProfileSave} disabled={profileLoading}
                        className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-60">
                        {profileLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={() => { setEditMode(false); setProfileData({ name: user?.name, email: user?.email }); }}
                        className="px-6 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg font-medium transition-all">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all">
                      <FiEdit2 size={15} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── PASSWORD TAB ── */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiLock className="text-pink-500" /> Change Password
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    { key: "currentPassword", label: "Current Password", show: "current" },
                    { key: "newPassword",      label: "New Password",     show: "new" },
                    { key: "confirmPassword",  label: "Confirm Password", show: "confirm" },
                  ].map(({ key, label, show }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type={showPasswords[show] ? "text" : "password"}
                          value={passwordData[key]}
                          onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required />
                        <button type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, [show]: !showPasswords[show] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          {showPasswords[show] ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={passwordLoading}
                    className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-60">
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === "addresses" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiMapPin className="text-pink-500" /> Saved Addresses
                  </h2>
                  <button
                    onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all">
                    <FiPlus size={15} /> Add Address
                  </button>
                </div>

                {addrLoading ? (
                  <div className="text-center py-10 text-gray-400">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                    <FiMapPin size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No saved addresses yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Add an address for faster checkout</p>
                    <button onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                      className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all">
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr._id}
                        className={`relative bg-gray-50 dark:bg-slate-700 rounded-xl border-2 p-4 transition-all
                          ${addr.isDefault ? "border-pink-400 dark:border-pink-500" : "border-gray-200 dark:border-slate-600"}`}>

                        {/* Label + Default badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-2.5 py-1 rounded-full">
                            <LabelIcon label={addr.label} /> {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                              <FiCheck size={11} /> Default
                            </span>
                          )}
                        </div>

                        {/* Address lines */}
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{addr.street}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{addr.city}, {addr.state} - {addr.zip}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {COUNTRIES.find(c => c.code === addr.country)?.name || addr.country}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                          <button
                            onClick={() => { setEditingAddr(addr); setShowAddrModal(true); }}
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium">
                            <FiEdit2 size={12} /> Edit
                          </button>
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                              <FiCheck size={12} /> Set Default
                            </button>
                          )}
                          <button onClick={() => handleDeleteAddress(addr._id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium ml-auto">
                            <FiTrash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiShoppingBag className="text-pink-500" /> Order History
                </h2>
                {ordersLoading ? (
                  <div className="text-center py-10 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <FiShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No orders placed yet.</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order._id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                          <p className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[200px]">{order._id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                          <p className="text-pink-500 font-bold">₹{order.totalPrice}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <div key={item.bookId._id} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-1.5 text-sm">
                            <img src={item.bookId.image} className="w-6 h-6 rounded object-cover" alt="" />
                            <span className="text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{item.bookId.name}</span>
                            <span className="text-gray-400 text-xs">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
