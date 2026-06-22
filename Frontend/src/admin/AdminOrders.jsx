import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdSearch, MdClose, MdCreditCard, MdPhoneAndroid, MdLocationOn, MdPerson } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Pending", "Paid", "Shipped", "Completed", "Cancelled"];

const statusStyle = {
  Pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Paid:      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Shipped:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Cancelled: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

const statusDot = {
  Pending:   "bg-yellow-400",
  Paid:      "bg-blue-500",
  Shipped:   "bg-indigo-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-red-500",
};

function PaymentBadge({ method }) {
  if (method === "upi") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
      <MdPhoneAndroid size={12} /> UPI
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      <MdCreditCard size={12} /> Card
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [authUser] = useAuth();

  const handleStatusSave = async () => {
    if (status === order.status) { onClose(); return; }
    setSaving(true);
    try {
      await axios.patch(
        `http://localhost:4001/admin/orders/${order._id}/status`,
        { status },
        { headers: { "x-admin-id": authUser?._id } }
      );
      toast.success(`Order status updated to ${status}`);
      onStatusChange(order._id, status);
      onClose();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Order Details</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{order._id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <MdClose size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Customer</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{order.userId?.name || "—"}</p>
              <p className="text-xs text-slate-400 truncate">{order.userId?.email || ""}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Date</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Payment</p>
              <PaymentBadge method={order.paymentMethod} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="font-bold text-pink-500 text-base">₹{order.totalPrice}</p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/30 rounded-xl">
            <MdLocationOn size={18} className="text-pink-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-pink-500 uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {order.address.street}, {order.address.city}, {order.address.state} — {order.address.zip}, {order.address.country}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                  {item.bookId?.image ? (
                    <img src={item.bookId.image} alt={item.bookId.name}
                      className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
                      onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-10 h-14 bg-slate-200 dark:bg-slate-600 rounded-lg shrink-0 flex items-center justify-center">
                      <FiPackage size={16} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {item.bookId?.name || "Unknown Book"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-bold text-pink-500 text-sm shrink-0">₹{item.quantity * item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status update */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {STATUS_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    status === s
                      ? `${statusStyle[s]} border-current`
                      : "border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button onClick={handleStatusSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-all disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [authUser] = useAuth();

  const headers = { "x-admin-id": authUser?._id };

  useEffect(() => {
    axios.get("http://localhost:4001/admin/orders", { headers })
      .then(res => { setOrders(res.data.orders); setFiltered(res.data.orders); })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(orders.filter(o => {
      const matchSearch =
        (o.userId?.name || "").toLowerCase().includes(q) ||
        (o.userId?.email || "").toLowerCase().includes(q) ||
        o._id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    }));
  }, [search, statusFilter, orders]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  };

  // Summary counts
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="loading loading-spinner loading-lg text-pink-500"></span>
    </div>
  );

  return (
    <div className="space-y-6">
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Orders</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={async () => {
              try {
                const toastId = toast.loading("Exporting orders...");
                const response = await axios.get("http://localhost:4001/admin/orders/export", {
                  headers,
                  responseType: "blob"
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `Orders_Export_${new Date().toISOString().split("T")[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                toast.success("Export downloaded successfully!", { id: toastId });
              } catch (error) {
                toast.error("Failed to export orders");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            📥 Export CSV
          </button>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="select select-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, email, ID…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 w-60" />
          </div>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s
                ? `${statusStyle[s]} border-current shadow-sm`
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
            }`}>
            <span className={`w-2 h-2 rounded-full ${statusDot[s]}`} />
            {s}
            <span className="font-bold">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No orders found.</td></tr>
              ) : filtered.map(order => (
                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}>
                  <td className="font-mono text-xs text-slate-400 max-w-[100px] truncate">
                    #{order._id.slice(-8)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(order.userId?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 dark:text-white truncate max-w-[110px]">
                          {order.userId?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[110px]">{order.userId?.email || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-500 dark:text-slate-300">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td><PaymentBadge method={order.paymentMethod} /></td>
                  <td className="font-semibold text-slate-800 dark:text-white">₹{order.totalPrice}</td>
                  <td className="text-slate-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[order.status] || "bg-slate-100 text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status] || "bg-slate-400"}`} />
                      {order.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedOrder(order)}
                      className="btn btn-xs btn-outline btn-primary gap-1">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
