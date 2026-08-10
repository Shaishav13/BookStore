import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import {
  MdPeople, MdMenuBook, MdShoppingCart, MdAttachMoney,
  MdImportContacts, MdDownload,
} from "react-icons/md";
import { useAuth } from "../context/AuthProvider";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow p-5 flex items-center gap-4 border-l-4 ${color}`}>
    <div className="text-4xl opacity-85 shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const statusColor = {
  Pending:   "badge-warning",
  Completed: "badge-success",
  Cancelled: "badge-error",
  Shipped:   "badge-info",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 dark:text-white mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: ₹{p.value.toFixed(0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser] = useAuth();

  useEffect(() => {
    const headers = { "x-admin-id": authUser?._id };
    const fetchAll = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          axios.get(`${API_URL}/admin/stats`, { headers }),
          axios.get(`${API_URL}/admin/revenue/monthly`, { headers }),
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-pink-500"></span>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-red-500 mt-20">Failed to load dashboard data.</div>;
  }

  const totalCombinedRevenue = (stats.totalRevenue || 0) + (stats.totalEBookRevenue || 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of your bookstore</p>
      </div>

      {/* ── Main Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard icon={<MdPeople className="text-blue-500" />} label="Total Users" value={stats.totalUsers} color="border-blue-500" />
        <StatCard icon={<MdShoppingCart className="text-green-500" />} label="Physical Orders" value={stats.totalOrders} color="border-green-500" />
        <StatCard icon={<MdDownload className="text-indigo-500" />} label="EBook Orders" value={stats.totalEBookOrders} color="border-indigo-500" />
        <StatCard icon={<MdMenuBook className="text-purple-500" />} label="Physical Books" value={stats.totalBooks} color="border-purple-500" />
        <StatCard icon={<MdImportContacts className="text-orange-500" />} label="EBooks" value={stats.totalEBooks} color="border-orange-500" />
        <StatCard
          icon={<MdAttachMoney className="text-pink-500" />}
          label="Total Revenue"
          value={`₹${totalCombinedRevenue.toFixed(2)}`}
          color="border-pink-500"
          sub={`Books ₹${stats.totalRevenue.toFixed(2)}  •  EBooks ₹${stats.totalEBookRevenue.toFixed(2)}`}
        />
      </div>

      {/* ── Revenue Chart ── */}
      {revenueData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-700 dark:text-white">Monthly Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 12 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />Books</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />EBooks</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEbooks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="books" name="Books" stroke="#ec4899" strokeWidth={2} fill="url(#colorBooks)" />
              <Area type="monotone" dataKey="ebooks" name="EBooks" stroke="#6366f1" strokeWidth={2} fill="url(#colorEbooks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Order Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-5">Orders by Status</h3>
          {stats.ordersByStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (() => {
            const total = stats.ordersByStatus.reduce((s, x) => s + x.count, 0);
            const colors = {
              Pending:   { bar: "bg-yellow-400", text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
              Paid:      { bar: "bg-blue-500",   text: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20" },
              Shipped:   { bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              Completed: { bar: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              Cancelled: { bar: "bg-red-400",    text: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20" },
            };
            return (
              <div className="space-y-4">
                {stats.ordersByStatus.map(s => {
                  const c = colors[s._id] || { bar: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" };
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={s._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold ${c.text}`}>{s._id || "Unknown"}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.count} <span className="font-normal text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total orders</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-white">{total}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Recent Physical Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-4">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-xs">
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="text-slate-700 dark:text-slate-200 truncate max-w-[90px]">
                        {order.userId?.name || "Unknown"}
                      </td>
                      <td className="font-medium text-slate-800 dark:text-white">₹{order.totalPrice}</td>
                      <td>
                        <span className={`badge badge-sm ${statusColor[order.status] || "badge-ghost"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent EBook Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-4">Recent EBook Sales</h3>
          {stats.recentEBookOrders.length === 0 ? (
            <p className="text-slate-400 text-sm">No ebook sales yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full text-sm">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-xs">
                    <th>Customer</th>
                    <th>EBook</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEBookOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
                        {order.userId?.name || "Unknown"}
                      </td>
                      <td className="text-slate-500 dark:text-slate-300 truncate max-w-[90px]">
                        {order.ebookId?.name || "—"}
                      </td>
                      <td className="font-medium text-indigo-600 dark:text-indigo-400">₹{order.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
