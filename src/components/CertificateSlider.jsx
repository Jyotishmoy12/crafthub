import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CertificateGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const carouselRef = useRef();

  const certificates = [
    { id: 1, image: 'certificate1.webp' },
    { id: 2, image: 'certificate2.webp' },
    { id: 3, image: 'certificate3.webp' },

  ];

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [certificates]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % certificates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [certificates.length]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x < -threshold && currentIndex < certificates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-3xl lg:text-3xl font-bold mb-6 text-center text-slate-800 my-20">
        <span className="text-blue-700 underline">My</span> <span className="text-orange-600 underline">Certificates</span>
      </h1>
      <div className="overflow-hidden w-full max-w-4xl" ref={carouselRef}>
        <motion.div 
          className="flex"
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={{ x: -currentIndex * (carouselRef.current ? carouselRef.current.offsetWidth : 0) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {certificates.map((cert) => (
            <div key={cert.id} className="min-w-full h-64 md:h-96 flex justify-center items-center">
              <img 
                src={cert.image} 
                alt="Certificate" 
                className="w-auto h-full object-contain rounded-2xl shadow-xl" 
              />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="flex gap-2 mt-4">
        {certificates.map((_, idx) => (
          <button 
            key={idx} 
            className={`w-3 h-3 rounded-full ${currentIndex === idx ? 'bg-blue-600' : 'bg-slate-300'}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default CertificateGallery;
