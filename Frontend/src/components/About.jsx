import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthProvider'

function About() {
  const [authUser] = useAuth();
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('Users') || 'null') : null;
  const displayName = authUser && storedUser ? (storedUser.name || storedUser.username || storedUser.email || 'User') : 'Guest';

  return (
    <>
      <Navbar />

      {/* Background */}
      <section className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 dark:text-white transition-all duration-300 min-h-screen">

        {/* Container */}
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          {/* Heading */}
          <header className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-500">
              About UB-Books
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              We&apos;re delighted to have you here, <span className="font-semibold text-black dark:text-white">{displayName}</span>!
            </p>
          </header>

          {/* Intro Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-10 transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Who We Are
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Welcome to <span className="font-semibold text-black dark:text-white">UB-Books</span> — your friendly online bookstore.
              We curate the best books across genres and deliver them straight to your doorstep.
              Our mission? Simple: make reading accessible, affordable, and absolutely delightful.
            </p>
          </div>

          {/* What We Do Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-10 transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
              What We Do
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We provide a handpicked selection of books, seamless checkout, and fast shipping.
              Browse popular categories, discover new authors, and manage your orders with ease.
              Whether you're a casual reader or a passionate bibliophile — there's something here for you.
            </p>
          </div>

          {/* Contact Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 md:p-10 transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Need Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Have questions, suggestions, or feedback?
              Reach out through our <a href="/contact" className="text-pink-500 font-medium hover:underline">Contact page</a>,
              or email us at{" "}
              <span className="font-mono text-black dark:text-gray-100">
                support@ubbooks.com
              </span>.
            </p>
          </div>

          {/* Bottom Line */}
          <div className="text-center text-gray-500 dark:text-gray-400 pt-4">
            <p className="text-sm">
              Thank you for choosing <span className="font-semibold text-black dark:text-white">UB-Books</span>.
              Happy reading! 📚
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </>
  )
}

export default About
