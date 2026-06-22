import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import PdfIcon from '../../public/pdficon.svg';
import download from '../../public/download.svg'
import { FiBook, FiTablet } from 'react-icons/fi';

// ── Order Tracking Stepper ──────────────────────────────────────────────────
const STEPS = ['Placed', 'Paid', 'Shipped', 'Delivered'];
const STATUS_TO_STEP = { Pending: 0, Paid: 1, Shipped: 2, Completed: 3, Cancelled: -1 };

function OrderTracker({ status }) {
  const currentStep = STATUS_TO_STEP[status] ?? 0;

  if (status === 'Cancelled') {
    return (
      <div className="mt-3 mb-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
          ❌ Order Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Order Tracking</p>
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400'
                } ${active ? 'ring-4 ring-pink-200 dark:ring-pink-900' : ''}`}>
                  {done ? '✓' : idx + 1}
                </div>
                <p className={`text-xs mt-1 font-medium whitespace-nowrap ${done ? 'text-pink-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {step}
                </p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-1 mb-5 rounded-full transition-all ${
                  idx < currentStep ? 'bg-pink-500' : 'bg-gray-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
function MyOrders() {
  const [orders, setOrder] = useState([]);
  const [ebookOrders, setEbookOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("physical");
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user._id : null;
  const displayName = authUser && user ? (user.name || user.username || user.email || 'User') : 'Guest';
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:4001/order/view/${userId}`);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 404) setOrder([]);
      else { console.error("error in fetching orders: " + err); setOrder([]); }
    }
  };

  const fetchEbookOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:4001/ebook/user/${userId}`);
      setEbookOrders(res.data);
    } catch {
      setEbookOrders([]);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchEbookOrders();
  }, []);

  const viewReceipt = (orderId) => {
    window.open(`http://localhost:4001/order/receipt/${orderId}`);
  };

  const downloadReceipt = (orderId) => {
    window.location.href = `http://localhost:4001/order/receipt/${orderId}?download=true`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 pt-28 pb-12 transition-all duration-300">

        {/* Heading */}
        <div className="text-center space-y-2 mb-8 px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-500">My Orders</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Welcome, <span className="font-semibold text-black dark:text-white">{displayName}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-xs mx-auto mb-8 bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm flex gap-2">
          <button
            onClick={() => setActiveTab("physical")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === "physical" ? "bg-pink-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"}`}>
            <FiBook size={14} /> Books
          </button>
          <button
            onClick={() => setActiveTab("ebooks")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === "ebooks" ? "bg-pink-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"}`}>
            <FiTablet size={14} /> eBooks
            {ebookOrders.length > 0 && (
              <span className="bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-200 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {ebookOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Order List */}
        <div className="max-w-6xl mx-auto px-4 space-y-8">

          {/* Physical Books Tab */}
          {activeTab === "physical" && (
            orders && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">Invoice ID</p>
                        {order.paymentMethod === "upi" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            📱 UPI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            💳 Card
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-sm sm:text-base text-black dark:text-white break-all">{order._id}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Order Date:</span> {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                        <span className="font-semibold">Address:</span> {order.address.street}, {order.address.city}, {order.address.state}, {order.address.country} - {order.address.zip}
                      </p>
                    </div>

                    {/* Invoice Dropdown */}
                    <div className="mt-4 md:mt-0">
                      <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="btn bg-pink-500 text-white hover:bg-pink-600">
                          Invoice
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-[1] w-44 p-2 space-y-1">
                          <li>
                            <button onClick={() => viewReceipt(order._id)} className="flex items-center gap-2 hover:bg-pink-100 dark:hover:bg-slate-600 rounded-md px-2 py-1">
                              <img src={PdfIcon} className="w-5 h-5" alt="pdf" /> View
                            </button>
                          </li>
                          <li>
                            <button onClick={() => downloadReceipt(order._id)} className="flex items-center gap-2 hover:bg-pink-100 dark:hover:bg-slate-600 rounded-md px-2 py-1">
                              <img src={download} className="w-5 h-5" alt="download" /> Download
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Order Tracking Stepper */}
                  <OrderTracker status={order.status} />

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-200 dark:border-slate-700"></div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="table w-full text-left">
                      <thead>
                        <tr className="text-sm bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
                          <th className="px-4 py-2">Book</th>
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Qty</th>
                          <th className="px-4 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {order.items.map((item) => (
                          <tr key={item.bookId._id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                            <td className="px-4 py-3">
                              <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => navigate(`/book/${item.bookId._id}`)}
                              >
                                <img src={item.bookId.image} className="h-12 w-12 rounded-md object-cover group-hover:opacity-80 transition-opacity" alt={item.bookId.name} />
                                <div>
                                  <p className="font-semibold text-black dark:text-white group-hover:text-pink-500 transition-colors">
                                    {item.bookId.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.bookId.title}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">₹{item.price}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3 font-medium text-pink-500">₹{item.quantity * item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end mt-6">
                    <p className="text-lg font-semibold">
                      Total: <span className="text-pink-500">₹{order.totalPrice}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-300 text-lg">No orders placed yet!</p>
            )
          )}

          {/* eBooks Tab */}
          {activeTab === "ebooks" && (
            ebookOrders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {ebookOrders.map(order => {
                  const ebook = order.ebookId;
                  if (!ebook) return null;
                  return (
                    <div key={order._id}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
                      <div className="h-48 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center relative">
                        <img src={ebook.image} alt={ebook.name}
                          className="max-h-full object-contain p-4"
                          onError={e => { e.target.style.display = 'none'; }} />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          <FiTablet size={10} /> eBook
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{ebook.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {ebook.author}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Purchased: {new Date(order.createdAt).toLocaleDateString("en-GB")}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/ebook/${ebook._id}`)}
                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all active:scale-95">
                            📖 Read Now
                          </button>
                          <button
                            onClick={() => navigate(`/ebook/${ebook._id}`)}
                            className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-all">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <FiTablet size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No eBooks purchased yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Browse our eBook store to find your next read</p>
                <button onClick={() => navigate("/course")}
                  className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all">
                  Browse eBooks
                </button>
              </div>
            )
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}

export default MyOrders;
