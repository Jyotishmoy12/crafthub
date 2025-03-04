import React from 'react';
import { motion } from 'framer-motion';

const CertificateSlider = () => {
  const certificates = [
    { id: 1, image: '/api/placeholder/800/600?sig=cert1' },
    { id: 2, image: '/api/placeholder/800/600?sig=cert2' },
    { id: 3, image: '/api/placeholder/800/600?sig=cert3' },
    { id: 4, image: '/api/placeholder/800/600?sig=cert4' },
    { id: 5, image: '/api/placeholder/800/600?sig=cert5' }
  ];

  return (
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
  );
};

export default CertificateSlider;