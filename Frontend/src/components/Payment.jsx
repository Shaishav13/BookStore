import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthProvider';
import Navbar from './Navbar';
import Footer from './Footer';

const stripePromise = loadStripe('pk_test_51SNo5JPgn4fVebeOZnUCBFWEsyv6ftDkye4mQqPxesrGRmSBe4gVxFziKgUvnUqT3Lgfufvj6Jh8ARC1ACklfq7E00AXOuhdaN');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#000',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#a0a0a0',
      },
    },
    invalid: {
      color: '#E53E3E',
      iconColor: '#E53E3E',
    },
  },
};

const CheckoutForm = ({ userId, address }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(
          'http://localhost:4001/order/payment-intents',
          { userId, address }
        );
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    createPaymentIntent();
  }, [userId, address]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
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

    if (error) {
      setLoading(false);
      alert('Payment failed: ' + error.message);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4001/order/create', {
        userId,
        address,
        paymentIntentId: paymentIntent.id,
      });

      if (response.status === 201) {
        alert('Order placed successfully');
        setTimeout(() => {
          window.location.href = `http://localhost:5173/success?orderId=${response.data._id}`;
        }, 2000);
      }
    } catch (error) {
      alert('Failed to place order: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">

      {/* Stripe Card Element Box */}
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !clientSecret || loading}
        className={`w-full py-3 text-lg font-medium rounded-lg text-white
          transition-all duration-300
          ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          }
        `}
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Secure & encrypted payment powered by Stripe
      </p>

    </form>
  );
};

const Payment = () => {
  const [authUser] = useAuth()
  const user = JSON.parse(localStorage.getItem("Users"))

  const userId = authUser ? user._id : "null";
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />

      <div className="pt-32 pb-10 flex justify-center px-4">
        <Elements stripe={stripePromise}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 dark:text-white border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl p-8">

            {/* Title */}
            <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
              Checkout
            </h1>

            {/* Sub title */}
            <p className="text-center mb-8 text-gray-500 dark:text-gray-400">
              Enter your address & payment details to continue
            </p>

            {/* Address Form */}
            <div className="space-y-4">
              {["street","city","state","zip","country"].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={address[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100
                             placeholder-gray-400 dark:placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-blue-600"
                />
              ))}
            </div>

            {/* Stripe Checkout */}
            <CheckoutForm userId={userId} address={address} />

          </div>
        </Elements>
      </div>

      <Footer />
    </>
  );
};

export default Payment;
