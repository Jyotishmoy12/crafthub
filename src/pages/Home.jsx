import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import GallerySection from '../components/GallerySection'
import Footer from '../components/Footer'
import CertificateSlider from '../components/CertificateSlider'
import AboutMeSection from '../components/AboutMeSection'
import WorkshopSection from '../components/WorkshopSection'

const Home = () => {
  return (
    <>
     <div className="overflow-x-hidden">
    <Navbar/>
    <HeroSection/>
    <WorkshopSection/>
    <CertificateSlider/>
   
    <AboutMeSection/>
    <GallerySection/>
    <Footer/>
    </div>
    </>
  )
}

export default Home