import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CarouselGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const carouselRef = useRef();

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

  // Calculate carousel scrollable width
  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [artworks]);

  // Automatic cycling effect: updates the index every 3 seconds and wraps around
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % artworks.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [artworks.length]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x < -threshold && currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center text-slate-800">
        <span className="text-blue-700">Contemporary</span>
        <span className="text-orange-600"> Art Collection</span>
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
          {artworks.map((artwork) => (
            <div key={artwork.id} className="min-w-full h-64 md:h-96 relative">
              <div 
                className="absolute inset-0 bg-center bg-contain md:bg-cover rounded-2xl shadow-xl"
                style={{ backgroundImage: `url(${artwork.image})` }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <h3 className="text-white text-xl font-semibold">{artwork.title}</h3>
                <p className="text-white text-sm">{artwork.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="flex gap-2 mt-4">
        {artworks.map((_, idx) => (
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

export default CarouselGallery;
