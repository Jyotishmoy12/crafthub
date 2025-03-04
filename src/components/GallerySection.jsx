import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StackRevealGallery = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const artworks = [
    {
      id: 1,
      title: 'Ceramic Whispers',
      artist: 'Elena Rodriguez',
      image: '/api/placeholder/1200/800?sig=ceramic1',
      description: 'A delicate ceramic piece that captures the subtle nuances of form and texture.',
      details: {
        technique: 'Hand-thrown porcelain',
        materials: 'Porcelain clay, crystalline glaze',
        dimensions: '12" x 8" x 8"'
      }
    },
    {
      id: 2,
      title: 'Woven Memories',
      artist: 'Sofia Chen',
      image: '/api/placeholder/1200/800?sig=textile1',
      description: 'A tapestry that weaves together threads of personal history and cultural heritage.',
      details: {
        technique: 'Hand weaving, natural dyeing',
        materials: 'Merino wool, plant-based dyes',
        dimensions: '48" x 36"'
      }
    },
    {
      id: 3,
      title: 'Woodland Symphony',
      artist: 'Marcus Williams',
      image: '/api/placeholder/1200/800?sig=sculpture1',
      description: 'A sculptural exploration of organic forms and natural rhythms.',
      details: {
        technique: 'Wood carving, steam bending',
        materials: 'Walnut wood, natural oil finish',
        dimensions: '24" x 18" x 12"'
      }
    },
    {
      id: 4,
      title: 'Luminous Horizons',
      artist: 'Isabella Martinez',
      image: '/api/placeholder/1200/800?sig=painting1',
      description: 'An abstract landscape that captures the ephemeral nature of light and emotion.',
      details: {
        technique: 'Layered acrylic, palette knife',
        materials: 'Acrylic on canvas',
        dimensions: '36" x 48"'
      }
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 ">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-10 text-center text-slate-800">
        <span className='text-blue-700'>Contemporary</span><span  className="text-orange-600"> Art Collection</span>
      </h1>
      
      <div className="relative w-full max-w-5xl h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            initial={{ 
              x: index * 80, 
              scale: 1,
              zIndex: artworks.length - index
            }}
            animate={{ 
              x: activeIndex !== null 
                ? activeIndex === index 
                  ? 0 
                  : activeIndex < index 
                    ? -window.innerWidth 
                    : window.innerWidth
                : index * 120,
              scale: activeIndex === index ? 1.1 : 0.8,
              zIndex: activeIndex === index ? 100 : artworks.length - index
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className={`
              absolute left-0 w-full sm:w-11/12 md:w-4/5 lg:w-2/3 xl:w-3/5 
              h-full rounded-2xl overflow-hidden shadow-xl cursor-pointer
            `}
            style={{
              transformOrigin: 'center left',
              backgroundImage: `url(${artwork.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay for non-active states */}
            {activeIndex !== index && (
              <div className="absolute inset-0 bg-slate-900 opacity-30 hover:opacity-20 transition-opacity" />
            )}

            {/* Active State Content */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/50 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white"
                >
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{artwork.title}</h2>
                  <p className="text-lg md:text-xl mb-3 opacity-90">{artwork.artist}</p>
                  <p className="mb-4 text-sm md:text-base opacity-80">{artwork.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <strong className="block mb-1">Technique</strong>
                      <p className="opacity-80">{artwork.details.technique}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Materials</strong>
                      <p className="opacity-80">{artwork.details.materials}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Dimensions</strong>
                      <p className="opacity-80">{artwork.details.dimensions}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StackRevealGallery;