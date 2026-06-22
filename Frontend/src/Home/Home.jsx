import React from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import FreeBook from '../components/FreeBook'
import FeaturedBooks from '../components/FeaturedBooks'
import FeaturedEBooks from '../components/FeaturedEBooks'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
       <Navbar/>
        <Banner/>
        <FeaturedBooks/>
        <FeaturedEBooks/>
        <FreeBook/>
        <Footer/>
    </>
  )
}

export default Home
