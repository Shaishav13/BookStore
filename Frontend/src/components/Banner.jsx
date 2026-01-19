import React from "react";
import banner from "../../public/Banner.png";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 dark:bg-slate-900 dark:text-white transition-all duration-300 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">

        {/* Left Content */}
        <div className="flex-1 space-y-6 text-center md:text-left">

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Discover Your Next 
            <span className="text-pink-500"> Favorite Book</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Welcome to UB Books — your gateway to knowledge and imagination.
            Explore curated collections, academic essentials, and inspiring classics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <button
              onClick={() => navigate("/course")}
              className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Browse Books
            </button>

            <button
              onClick={() => navigate("/about")}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-600
                         hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white 
                         font-medium text-base transition-all duration-300 active:scale-95"
            >
              Learn About Us
            </button>
          </div>

        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center md:justify-end">
          <img
            src={banner}
            alt="Books banner"
            className="w-[360px] md:w-[500px] lg:w-[550px] drop-shadow-lg select-none"
          />
        </div>

      </div>
    </section>
  );
};

export default Banner;
