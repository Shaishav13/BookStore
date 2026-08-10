import React, { useEffect, useState } from 'react'
import axios from 'axios';
import API_URL from '../config/api';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useCartContext } from '../context/CartProvider';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();
  const [cartIsEmpty, setCartIsEmpty] = useState("false");
  const [totalAmount, setTotalAmount] = useState(0);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const user = JSON.parse(localStorage.getItem("Users"))
  const userId = user._id;
  const { cartCount, setCartCount } = useCartContext();
  const fetchCartItems = async () => {
    if (user) {
      await axios.get(`${API_URL}/cart/${user._id}`)
        .then(res => {
          setCartCount(res.data.items.length);
          setCartIsEmpty(false)
          setCart(res.data)
        })
        .catch(err => {
          console.log(err.response.data.message)
          if (err.response.data.message === "Cart Not Found") {
            setCartIsEmpty(true)
          }
          console.error(err + cartIsEmpty)
        })
    }

  }
  useEffect(() => {
    fetchCartItems();
    if (cart != null) {
      let total = 0;
      cart.items.forEach(item => {
        total += item.bookId.price * item.quantity
      })
      setTotalAmount(total);
    }

  }, [cartIsEmpty, cartCount])
  if (cart === null && cartIsEmpty === false) {
    return <div>Loading...</div>;
  }
  const deleteCartItem = async (id) => {
    setDeletingItemId(id);
    setTimeout(async () => {
      await axios.post(`${API_URL}/cart/deleteitem`, {
        userId,
        itemId: id,
      }).then(res => {
        toast.success("Item deleted successfully !");
      }).catch(err => {
        toast.error("Not able to delete item !");
      })
      fetchCartItems();
    }, 1000);
   
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
        <div className='pt-28 pb-16 max-w-3xl mx-auto px-4'>

          <h1 className='text-pink-500 text-2xl sm:text-3xl md:text-5xl animate__animated animate__backInDown mb-4'>Shopping Cart</h1>

          <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-6'>
            <h2 className='text-green-500 text-lg sm:text-2xl font-semibold'>Total: ₹{totalAmount}</h2>
            
            {cartIsEmpty || (cart && cart.items.length === 0) ? (
              <button 
                className='w-full sm:w-auto bg-gray-400 rounded-full px-5 py-2 text-white cursor-not-allowed'
                disabled
                onClick={(e) => { e.preventDefault(); toast.error("Your cart is empty! Add some books before checkout."); }}
              >
                Checkout
              </button>
            ) : (
              <Link 
                className='w-full sm:w-auto text-center bg-pink-500 rounded-full px-5 py-2 text-white hover:bg-red-600 transition-colors duration-200' 
                to='/payment'
              >
                Checkout
              </Link>
            )}
          </div>

          {(cartIsEmpty || (cart && cart.items.length === 0)) && (
            <div className='bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-6 rounded'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <svg className='h-5 w-5 text-yellow-500' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium'>
                    Your cart is empty! Browse our collection and add some books to get started.
                  </p>
                </div>
              </div>
            </div>
          )}


          {
            cartIsEmpty || (cart && cart.items.length === 0) ? (
              <div className='text-center py-8'>
                <div className='text-gray-500 dark:text-gray-400 text-lg mb-4'>
                  <svg className='mx-auto h-16 w-16 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                  </svg>
                  <p className='text-xl font-medium'>Your cart is empty</p>
                  <p className='text-sm mt-2'>Discover amazing books and add them to your cart!</p>
                </div>
                <Link 
                  to='/course' 
                  className='bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-block'
                >
                  Browse Books
                </Link>
              </div>
            ) : cart.items.map((item) => (
                <div
                  key={item.bookId._id} 
                  className={`card m-4 bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border max-w-2xl
                     ${deletingItemId === item._id ? 'animate__animated animate__fadeOut' : ''}`}
                >
                  <div className='flex flex-col sm:flex-row'>
                    <div
                      className="w-full sm:w-40 h-40 flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/book/${item.bookId._id}`)}
                    >
                      <img src={item.bookId.image} className="w-full h-full object-cover p-2 rounded-md hover:opacity-80 transition-opacity" alt={item.bookId.name} />
                    </div>
                    <div className='flex-grow p-4'>
                      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                        <div className='mb-4 sm:mb-0'>
                          <h3
                            className='font-semibold text-lg cursor-pointer hover:text-pink-500 transition-colors'
                            onClick={() => navigate(`/book/${item.bookId._id}`)}
                          >
                            {item.bookId.name}
                          </h3>
                          <p className='text-gray-600 dark:text-gray-400'>{item.bookId.title}</p>
                          {item.bookId.inStock === false ? (
                            <p className='text-red-500 font-bold text-lg'>Out of Stock</p>
                          ) : (
                            <p className='text-green-600 dark:text-green-400 font-bold text-lg'>₹{item.bookId.price}</p>
                          )}
                        </div>
                        <div className='flex items-center gap-4'>
                          <div className='flex flex-col items-center'>
                            <label className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Quantity</label>
                            <select
                              className="cursor-pointer dark:bg-slate-900 dark:text-white dark:border rounded px-2 py-1 border border-gray-300" 
                              defaultValue={item.quantity}
                              onChange={(e) => { 
                                // TODO: Implement quantity update functionality
                                console.log('Quantity changed to:', e.target.value);
                              }}
                            >
                              {Array.from(Array(6), (e, i) => {
                                return (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <button 
                            className='text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors duration-200'
                            onClick={() => deleteCartItem(item._id)}
                            title="Remove item"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

      </div>
      <Footer />

    </>
  )
}

export default Cart
