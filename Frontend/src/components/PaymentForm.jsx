import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:5173/',
      },
    });

    if (error) {
      console.log('[error]', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl p-8 border border-gray-200 dark:border-slate-700 transition-all duration-300">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Complete Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 text-lg font-medium rounded-lg transition-all duration-300 text-white 
            ${loading 
              ? "bg-slate-500 cursor-not-allowed" 
              : "bg-black hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"}
          `}
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            "Place Order"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Secure & encrypted payment powered by Stripe
        </p>

      </form>
    </div>
  );
};

export default PaymentForm;
