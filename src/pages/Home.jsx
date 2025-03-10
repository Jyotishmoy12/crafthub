import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import Footer from '../components/Footer';
import CertificateSlider from '../components/CertificateSlider';
import AboutMeSection from '../components/AboutMeSection';
import WorkshopSection from '../components/WorkshopSection';

const Home = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll events for animations and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Show scroll-to-top button after scrolling down
      setShowScrollTop(window.scrollY > 500);
      
      // Determine which section is currently in view
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 300 && scrollY < sectionTop + sectionHeight - 300) {
          setActiveSection(section.id || 'hero');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="relative overflow-x-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 transform -translate-x-1/2"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-100 rounded-full opacity-30 transform translate-x-1/2"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-100 rounded-full opacity-20"></div>
        </div>
        
        {/* Fixed navigation indicator */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
          <div className="flex flex-col items-center space-y-4">
            {['hero', 'workshop', 'certificates', 'about', 'gallery'].map((section) => (
              <button
                key={section}
                onClick={() => {
                  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === section 
                    ? 'bg-blue-600 w-4 h-4' 
                    : 'bg-gray-400 hover:bg-gray-600'
                }`}
                aria-label={`Scroll to ${section} section`}
              />
            ))}
          </div>
        </div>
        
        {/* Original navbar - kept exactly as is */}
        <Navbar />
        
        {/* Main content sections with IDs */}
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="workshop">
          <WorkshopSection />
        </section>
        
        <section id="certificates">
          <CertificateSlider />
        </section>
        
        <section id="about">
          <AboutMeSection />
        </section>
        
        <section id="gallery">
          <GallerySection />
        </section>
        
        <Footer />
        
        {/* Scroll to top button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg z-50 transition-all duration-300 transform ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default Home;