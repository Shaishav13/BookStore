import React from 'react'
import { Link } from 'react-router-dom'
import { FaTwitter, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'

function Footer() {
  return (
    <>
      <hr />
      <footer className="footer footer-center p-10 text-base-content rounded dark:bg-slate-900 dark:text-white">
        <nav className="grid grid-flow-col gap-4">
          <Link className="link link-hover" to='/about'>About</Link>
          <Link className="link link-hover" to='/contact'>Contact</Link>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Press kit</a>
        </nav>
        <nav>
          <div className="grid grid-flow-col gap-4">
            {/* X / Twitter */}
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
              <FaTwitter size={24} />
            </a>

            {/* YouTube */}
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
              <FaYoutube size={24} />
            </a>

            {/* Facebook */}
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <FaFacebook size={24} />
            </a>

            {/* LinkedIn */}
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={24} />
            </a>
          </div>
        </nav>
        <aside>
          <p>Just one more page... because reality can wait.</p><br />
          <p>UB-Books</p>
        </aside>
      </footer>
    </>
  )
}

export default Footer