import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CraftCategories from '../components/CraftCategories'
import GallerySection from '../components/GallerySection'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
    <Navbar/>
    <HeroSection/>
    <CraftCategories/>
    <GallerySection/>
    <Footer/>
    </>
  )
}

export default Home