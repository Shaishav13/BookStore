import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import PdfIcon from '../../public/pdficon.svg';
import download from '../../public/download.svg'

function MyOrders() {

  const [orders, setOrder] = useState(null);
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user._id : null;
  const displayName = authUser && user ? (user.name || user.username || user.email || 'User') : 'Guest';

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:4001/order/view/${userId}`);
      setOrder(res.data);
    } catch (err) {
      console.error("error in fetching orders: " + err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // derived total items across all orders (sum of quantities)
  const totalOrderedItems = orders
    ? orders.reduce((orderAcc, order) => {
      const itemsCount = order.items.reduce(
        (itmAcc, itm) => itmAcc + (Number(itm.quantity) || 0),
        0
      );
      return orderAcc + itemsCount;
    }, 0)
    : 0;

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

      {/* Page Wrapper */}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 pt-28 pb-12 transition-all duration-300">

        {/* Heading */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-bold text-pink-500">My Orders</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome, <span className="font-semibold text-black dark:text-white">{displayName}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total ordered items: 
            <span className="text-pink-500 font-semibold ml-1">{totalOrderedItems}</span>
          </p>
        </div>

        {/* Order List */}
        <div className="max-w-6xl mx-auto px-4 space-y-8">

          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-300 hover:shadow-xl"
              >

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between">

                  {/* Left Info */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                      Invoice ID
                    </p>
                    <h2 className="font-bold text-lg text-black dark:text-white">
                      {order._id}
                    </h2>

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
                          <button
                            onClick={() => viewReceipt(order._id)}
                            className="flex items-center gap-2 hover:bg-pink-100 dark:hover:bg-slate-600 rounded-md px-2 py-1"
                          >
                            <img src={PdfIcon} className="w-5 h-5" />
                            View
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => downloadReceipt(order._id)}
                            className="flex items-center gap-2 hover:bg-pink-100 dark:hover:bg-slate-600 rounded-md px-2 py-1"
                          >
                            <img src={download} className="w-5 h-5" />
                            Download
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200 dark:border-slate-700"></div>

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
                          
                          {/* Book Name & Image */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={item.bookId.image} className="h-12 w-12 rounded-md object-cover" />
                              <div>
                                <p className="font-semibold text-black dark:text-white">
                                  {item.bookId.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.bookId.title}
                                </p>
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
            <p className="text-center text-gray-500 dark:text-gray-300 text-lg">
              No orders placed yet!
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MyOrders;
