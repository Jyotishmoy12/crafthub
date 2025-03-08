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

  return (
    <>
    <h1 className="text-center font-bold text-3xl"><span className='text-blue-700'>My</span> <span className='text-orange-600'>Certificates</span></h1>
    <div className="relative w-full overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-gray-50 to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-gray-50 to-transparent z-20" />
      </div>

      <motion.div 
        className="flex"
        animate={{
          x: ['0%', '-100%'],
          transition: {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 10,
              ease: 'linear'
            }
          }
        }}
      >
        <div className="flex space-x-6 mr-6">
          {certificates.map((cert) => (
            <div 
              key={cert.id} 
              className="w-[400px] h-[300px] flex-shrink-0"
            >
              <img 
                src={cert.image} 
                alt="Certificate" 
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          ))}
        </div>
        
        {/* Duplicate for continuous sliding */}
        <div className="flex space-x-6">
          {certificates.map((cert) => (
            <div 
              key={`duplicate-${cert.id}`} 
              className="w-[400px] h-[300px] flex-shrink-0"
            >
              <img 
                src={cert.image} 
                alt="Certificate" 
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default CertificateSlider;