import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import Slider from "react-slick";
import Card from "./Card";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function FreeBook() {
  const [book, setBook] = useState([]);

  useEffect(() => {
    const getBook = async () => {
      try {
        const res = await axios.get(`${API_URL}/book`);
        setBook(res.data.filter((data) => data.category === "Free"));
      } catch (error) {
        console.error(error);
      }
    };
    getBook();
  }, []);

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3500,
    cssEase: "ease-in-out",
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024, // laptop
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: true,
        },
      },
      {
        breakpoint: 768, // tablet
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480, // phone
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-slate-900 dark:text-white py-16 px-4 md:px-8 transition-all duration-300">

        <div className="max-w-6xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-pink-500">
              Free Courses & Books
            </h1>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Learn without limits — explore curated free resources to boost your knowledge, skills, and confidence.
            </p>
          </div>

          {/* Slider Section */}
          <div className="px-2 md:px-0">
            {book.length > 0 ? (
              <Slider {...settings}>
                {book.map((data) => (
                  <div key={data._id} className="px-2 md:px-3">
                    <div className="transform transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                      <Card item={data} />
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                No free courses available right now.
              </p>
            )}
          </div>

          {/* Bottom Link */}
          <div className="text-center mt-10">
            <a
              href="/course"
              className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Explore All Courses →
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

export default FreeBook;
