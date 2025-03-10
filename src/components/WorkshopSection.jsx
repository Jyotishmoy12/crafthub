import React from 'react';
import { motion } from 'framer-motion';


const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const WorkshopSection = () => {
  // Replace these paths with your actual workshop photo URLs
  const photos = [
    'workshop1.jpeg',
    'workshop2.jpeg',
    'workshop3.jpeg',
    'workshop4.jpeg',
    'workshop5.jpeg',
    'workshop6.jpeg'
  ];

  return (
    <section className="py-12 -my-30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold"><span className='text-blue-700 underline'>Offline</span> <span className='text-orange-600 underline'>Workshops</span></h2>
          {/* <p className="mt-2 text-lg text-gray-600">
            Discover the hands-on experience of our offline workshops.
          </p> */}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md"
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.3 }}
            >
              <img
                src={photo}
                alt={`Workshop ${index + 1}`}
                className="w-full h-48 sm:h-64 object-cover shadow-lg"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkshopSection;
