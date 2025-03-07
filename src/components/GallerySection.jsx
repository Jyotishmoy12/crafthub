import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StackRevealGallery = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const artworks = [
    {
      id: 1,
      title: 'Ceramic Whispers',
      image: 'gallery1.webp',
      description: 'A delicate ceramic piece that captures the subtle nuances of form and texture.',
      artist: 'Elena Morales',
      year: '2023'
    },
    {
      id: 2,
      title: 'Woven Memories',
      image: 'gallery2.webp',
      description: 'A tapestry that weaves together threads of personal history and cultural heritage.',
      artist: 'James Chen',
      year: '2022'
    },
    {
      id: 3,
      title: 'Woodland Symphony',
      image: 'gallery3.webp',
      description: 'A sculptural exploration of organic forms and natural rhythms.',
      artist: 'Nina Patel',
      year: '2024'
    },
    {
      id: 4,
      title: 'Luminous Horizons',
      image: 'gallery5.webp',
      description: 'An abstract landscape that captures the ephemeral nature of light and emotion.',
      artist: 'Marcus Lee',
      year: '2021'
    },
    {
      id: 5,
      title: 'Urban Fragments',
      image: 'gallery4.webp',
      description: 'A mixed-media piece exploring the intersection of architecture and human experience.',
      artist: 'Sophia Rivera',
      year: '2023'
    },
    {
      id: 6,
      title: 'Digital Dreams',
      image: 'gallery6.webp',
      description: 'A contemporary digital artwork exploring virtual realities and future landscapes.',
      artist: 'Aiden Zhao',
      year: '2024'
    }
  ];

  // Calculate offset for each card based on screen size
  const getOffset = (index) => {
    if (isMobile) {
      return index * 40; // Smaller offset on mobile
    } else {
      return index * 80; // Larger offset on desktop
    }
  };

  // Calculate x position for animations - simplified to avoid nested ternaries
  const getXPosition = (index) => {
    if (activeIndex === null) {
      return getOffset(index);
    }
    
    if (activeIndex === index) {
      return 0;
    }
    
    const direction = activeIndex < index ? 1 : -1;
    const distance = isMobile ? window.innerWidth * 0.6 : window.innerWidth * 0.8;
    
    return direction * distance;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-slate-50">
      <motion.h1 
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-10 text-center text-slate-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-blue-700">Contemporary</span>
        <span className="text-orange-600"> Art Collection</span>
      </motion.h1>
      
      {/* Gallery navigation buttons */}
      <div className="flex gap-2 mb-6">
        {artworks.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full ${activeIndex === index ? 'bg-blue-600' : 'bg-slate-300'}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      
      <div className="relative w-full max-w-6xl h-[50vh] md:h-[60vh] lg:h-[70vh] flex items-center justify-center">
        {artworks.map((artwork, index) => {
          // Calculate visibility thresholds for mobile - show at least 3 cards
          const isVisible = isMobile 
            ? (activeIndex === null || Math.abs(index - (activeIndex || 0)) < 3)
            : true;
            
          return isVisible && (
            <motion.div
              key={artwork.id}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              initial={{ 
                x: getOffset(index), 
                scale: 0.9,
                zIndex: artworks.length - index,
                rotateY: index % 2 === 0 ? -5 : 5 // Alternate slight rotation
              }}
              animate={{ 
                x: getXPosition(index),
                scale: activeIndex === index ? 1 : 0.85,
                zIndex: activeIndex === index ? 100 : artworks.length - index,
                rotateY: activeIndex === index ? 0 : index % 2 === 0 ? -5 : 5
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30 
              }}
              className={`
                absolute left-0 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 
                h-full rounded-2xl overflow-hidden shadow-xl cursor-pointer
                transition-all duration-300
              `}
              style={{
                transformOrigin: 'center center',
                backgroundImage: `url(${artwork.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay for non-active states with improved hover effect */}
              {activeIndex !== index && (
                <motion.div 
                  className="absolute inset-0 bg-slate-900 transition-opacity"
                  initial={{ opacity: 0.4 }}
                  whileHover={{ opacity: 0.2 }}
                />
              )}

              {/* Title preview on non-active cards */}
              {activeIndex !== index && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                  <h3 className="text-white text-lg md:text-xl font-semibold">{artwork.title}</h3>
                </div>
              )}

              {/* Active State Content with enhanced details */}
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 }}
                    className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">{artwork.title}</h2>
                      
                      <p className="mb-4 text-sm md:text-base opacity-90">{artwork.description}</p>
                     
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      {/* Instruction text for better UX */}
      <motion.p 
        className="text-center text-slate-500 mt-6 text-sm md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1 }}
      >
        {activeIndex === null ? "Click on an artwork to explore" : "Click again to return to gallery view"}
      </motion.p>
    </div>
  );
};

export default StackRevealGallery;