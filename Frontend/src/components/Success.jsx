import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Success = () => {
    const location = useLocation();
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setOrderId(params.get('orderId'));
    }, [location]);
    
    useEffect(()=>{
        setTimeout(()=>{
        window.location.href = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/`;
        },7000)
    },[])

    return (
        <>
            <Navbar />
            <div className='min-h-screen flex items-center justify-center px-4 pt-28 pb-16 bg-gray-50 dark:bg-slate-900 dark:text-white'>
                <div className="w-full max-w-md bg-white dark:bg-slate-900 dark:text-white dark:border rounded-2xl shadow-xl p-6 sm:p-10 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className='text-pink-500 text-2xl sm:text-4xl font-bold mb-3'>Payment Successful!</h2>
                    <p className='text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2'>
                        Thank you for your purchase!
                    </p>
                    <p className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2 break-all'>
                        Order ID: <span className="font-mono font-semibold text-pink-500">{orderId}</span>
                    </p>
                    <p className='text-gray-400 dark:text-gray-500 text-xs mt-4'>You will be redirected shortly...</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Success;
