import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CraftCategories from '../components/CraftCategories'
import GallerySection from '../components/GallerySection'
import Footer from '../components/Footer'
import CertificateSlider from '../components/CertificateSlider'

const Home = () => {
  return (
    <>
     <div className="overflow-x-hidden">
    <Navbar/>
    <HeroSection/>
    <CertificateSlider/>
    <CraftCategories/>
    <GallerySection/>
    <Footer/>
    </div>
    </>
  )
}

export default Home