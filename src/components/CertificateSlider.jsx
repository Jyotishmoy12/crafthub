import React from 'react';
import { motion } from 'framer-motion';

const CertificateSlider = () => {
  const certificates = [
    { id: 1, image: 'certificate1.webp' },
    { id: 2, image: 'certificate2.webp' },
    { id: 3, image: 'certificate3.webp' },
    { id: 4, image: 'certificate1.webp' },
    { id: 5, image: 'certificate2.webp' }
  ];

  // Define animation variants outside the component render
  const slideAnimation = {
    animate: {
      x: [0, '-50%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 20,
          ease: 'linear',
        }
      }
    }
  };

  return (
    <>
      <h1 className="text-center font-bold text-3xl mb-4 my-30">
        <span className='text-blue-700 '>My</span> <span className='text-orange-600'>Certificates</span>
      </h1>
      <div className="relative w-full overflow-hidden py-8">
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-gray-50 to-transparent z-20" />
          <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-gray-50 to-transparent z-20" />
        </div>

        <div className="flex overflow-hidden">
          <motion.div 
            className="flex whitespace-nowrap"
            variants={slideAnimation}
            initial="initial"
            animate="animate"
          >
            {/* First set of certificates */}
            {certificates.map((cert) => (
  <div 
    key={cert.id} 
    className="inline-block w-70 sm:w-72 md:w-80 lg:w-96 h-60 sm:h-56 md:h-60 lg:h-72 mx-3 sm:mx-4"
  >
    <img 
      src={cert.image} 
      alt="Certificate" 
      className="w-full h-full object-cover rounded-xl shadow-lg"
    />
  </div>
))}

            
            {/* Duplicate set for seamless looping */}
            {certificates.map((cert) => (
              <div 
                key={`duplicate-${cert.id}`} 
                className="inline-block w-48 sm:w-64 md:w-80 lg:w-96 h-36 sm:h-48 md:h-60 lg:h-72 mx-3 sm:mx-4"
              >
                <img 
                  src={cert.image} 
                  alt="Certificate" 
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CertificateSlider;
