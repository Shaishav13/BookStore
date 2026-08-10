import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Login from './Login'
import { useForm } from "react-hook-form"
import axios from 'axios'
import API_URL from '../config/api';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function Signup() {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/course";
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        setIsLoading(true);
        const user = {
            name: data.name,
            email: data.email,
            password: data.password,
        }
        await axios.post(`${API_URL}/user/signup`, user)
            .then((res) => {
                console.log("User Info", res.data);
                if (res.data) {
                    toast.success("Signup successful! Welcome to UB-Books");
                    setTimeout(() => {
                        navigate(from, { replace: true })
                        window.location.reload()
                    }, 500)
                }
                localStorage.setItem("Users", JSON.stringify(res.data.user))
            }).catch((err) => {
                if (err.response) {
                    console.log(err)
                    toast.error("Error : " + err.response.data.message);
                }
            }).finally(() => {
                setIsLoading(false);
            })
    }

    return (
        <>
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8'>
                <div className="max-w-md w-full">
                    {/* Close Button */}
                    <Link 
                        to='/' 
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Link>

                    {/* Card Container */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
                        {/* Header Section with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
                            <div className="flex items-center justify-center mb-2">
                                <img src="/book.png" alt="Logo" className="h-12 w-12 mr-3" />
                                <h2 className="text-3xl font-bold text-white">UB-Books</h2>
                            </div>
                            <p className="text-center text-blue-100 text-sm">Create your account and start exploring books</p>
                        </div>

                        {/* Form Section */}
                        <div className="px-8 py-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register("name", { 
                                                required: "Name is required",
                                                minLength: {
                                                    value: 2,
                                                    message: "Name must be at least 2 characters"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-200
                                                ${errors.name 
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:bg-slate-700' 
                                                    : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white'
                                                }`}
                                            type='text'
                                            placeholder='Enter your full name'
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className='mt-1 text-sm text-red-500 flex items-center'>
                                            <span className="mr-1">⚠</span>
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-200
                                                ${errors.email 
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:bg-slate-700' 
                                                    : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white'
                                                }`}
                                            type='email'
                                            placeholder='Enter your email'
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className='mt-1 text-sm text-red-500 flex items-center'>
                                            <span className="mr-1">⚠</span>
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            {...register("password", { 
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-200
                                                ${errors.password 
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:bg-slate-700' 
                                                    : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white'
                                                }`}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='Enter your password'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className='mt-1 text-sm text-red-500 flex items-center'>
                                            <span className="mr-1">⚠</span>
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                        ${isLoading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">Already have an account?</span>
                                    </div>
                                </div>

                                {/* Login Link */}
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("my_modal_3").showModal()}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
                                    >
                                        Sign in to your account
                                    </button>
                                </div>
                            </form>
                            {/* Login modal must be outside the form to avoid nested <form> DOM warning */}
                            <Login />
                        </div>
                    </div>

                    {/* Footer Text */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        By signing up, you agree to our{' '}
                        <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Signup
