import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdaptiveGallery = () => {
  const images = [
    'https://source.unsplash.com/random/800x600?nature',
    'https://source.unsplash.com/random/800x600?architecture',
    'https://source.unsplash.com/random/800x600?city',
    'https://source.unsplash.com/random/800x600?landscape',
    'https://source.unsplash.com/random/800x600?technology',
    'https://source.unsplash.com/random/800x600?abstract',
    'https://source.unsplash.com/random/800x600?art',
    'https://source.unsplash.com/random/800x600?water',
    'https://source.unsplash.com/random/800x600?forest',
  ];

  const [expanded, setExpanded] = useState(false);
  const [radius, setRadius] = useState(250);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Update mobile status and radius on resize
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      // Adjust the radial radius for larger screens vs. mobile
      setRadius(mobileView ? window.innerWidth / 3 : 250);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const numImages = images.length;
  const angleStep = 360 / numImages;

  return (
    <section className="relative py-20 overflow-hidden ">
      <div
        className={`container mx-auto px-6 relative ${
          // For large screens, use a fixed height so radial layout has space.
          // For mobile expanded, allow auto height (vertical stack).
          expanded && isMobile ? 'min-h-screen' : 'h-[500px] md:h-[600px]'
        }`}
      >
        {/* Toggle button in normal flow so it doesn't overlap images */}
        <div className="flex justify-center mb-6 py-7 -my-20">
          <motion.button
            onClick={() => setExpanded((prev) => !prev)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? 'Collapse Gallery' : 'Expand Gallery'}
          </motion.button>
        </div>

        {/* Wrapper for images */}
        <div className="relative w-full h-full">
          {expanded ? (
            // When expanded:
            isMobile ? (
              // 1) Mobile: Vertical stack
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {images.map((src, index) => (
                  <motion.div
                    key={index}
                    className="w-full max-w-sm h-64 rounded-xl overflow-hidden shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={src}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // 2) Larger screens: Radial layout
              images.map((src, index) => {
                const angle = angleStep * index - 90; // start from top
                const rad = (angle * Math.PI) / 180;
                const targetX = radius * Math.cos(rad);
                const targetY = radius * Math.sin(rad);

                return (
                  <motion.div
                    key={index}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                               w-48 h-48 rounded-xl overflow-hidden shadow-2xl"
                    animate={{
                      x: targetX,
                      y: targetY,
                      rotate: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 250,
                      damping: 20,
                    }}
                  >
                    <img
                      src={src}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                );
              })
            )
          ) : (
            // When collapsed: All images stacked in the center with random rotation
            images.map((src, index) => (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           w-48 h-48 rounded-xl overflow-hidden shadow-2xl"
                animate={{
                  x: 0,
                  y: 0,
                  rotate: Math.random() * 360,
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 20,
                }}
              >
                <img
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default AdaptiveGallery;
