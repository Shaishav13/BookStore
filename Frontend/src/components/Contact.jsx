import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useForm } from "react-hook-form";
import axios from "axios";
import API_URL from "../config/api";
import toast from "react-hot-toast";

function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const contactData = {
      name: data.name,
      email: data.email,
      message: data.message,
    };

    try {
      const res = await axios.post(`${API_URL}/contact/`, contactData);
      if (res.data) {
        toast.success("Message sent successfully");
        reset();
      } else {
        toast.error("Something went wrong.");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-slate-900 transition-all duration-300">

        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 transition-all duration-300">

          <h3 className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
            Contact Us
          </h3>

          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Have questions? We'd love to hear from you.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                {...register("name", { required: true })}
                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 
                           bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
              />

              {errors.name && (
                <p className="text-sm text-red-500 mt-1">This field is required</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 
                           bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
              />

              {errors.email && (
                <p className="text-sm text-red-500 mt-1">This field is required</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>

              <textarea
                placeholder="Enter your message"
                {...register("message", { required: true })}
                rows={4}
                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 
                           bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200
                           placeholder-gray-400 dark:placeholder-gray-500
                           resize-none
                           focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
              />

              {errors.message && (
                <p className="text-sm text-red-500 mt-1">This field is required</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 rounded-lg
                           transform hover:-translate-y-0.5 transition-all duration-200 shadow-md
                           hover:shadow-lg active:scale-95"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Contact;
