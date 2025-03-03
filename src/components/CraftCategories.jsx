import React from 'react';
import { motion } from 'framer-motion';

const CraftCategories = () => {
  const categories = [
    {
      id: 1,
      name: "Fabric Painting",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <path d="M21 3v18M3 16V3h18M9 21a3 3 0 1 0 6 0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-pink-100 text-pink-600",
      accent: "bg-pink-200",
      description: "Express yourself"
    },
    {
      id: 2,
      name: "Resin Art",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <path d="M9 3L5 7M5 7L9 11M5 7H17M17 7L21 3M17 7L21 11" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-indigo-100 text-indigo-600",
      accent: "bg-indigo-200",
      description: "Weave & create"
    },
    {
      id: 3,
      name: "Paper Crafts",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 3v18" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-yellow-100 text-yellow-600",
      accent: "bg-yellow-200",
      description: "Fold & shape"
    },
    {
      id: 4,
      name: "Ceramics & Pottery",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <path d="M8 2h8M12 2v6M3 10h18M5 14a7 7 0 1 0 14 0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-green-100 text-green-600",
      accent: "bg-green-200",
      description: "Mold & design"
    },
    {
      id: 5,
      name: "Jewelry Making",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3C9.5 7.5 7 9.5 3 12C7.5 14.5 9.5 17 12 21C14.5 17 17 14.5 21 12C17 9.5 14.5 7.5 12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-purple-100 text-purple-600",
      accent: "bg-purple-200",
      description: "Craft accessories"
    },
    {
      id: 6,
      name: "Glass Painting",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 md:w-10 md:h-10">
          <path d="M3 21h18M11 3L5 8.5V21M13 3l6 5.5V21" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "bg-orange-100 text-orange-600",
      accent: "bg-orange-200",
      description: "Shape & sculpt"
    }
  ];
  
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 inline-block relative">
            <span className="relative z-10">Explore Categories</span>
            <span className="absolute -bottom-2 left-0 w-full h-3 bg-pink-200 -z-10"></span>
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-sm sm:text-base">Discover your perfect craft through our specially curated categories</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
          >
            {categories.map((category, index) => (
              <motion.div 
                key={category.id}
                className={`${category.color} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer aspect-square relative group`}
                custom={index}
                variants={{
                  hidden: (i) => ({ 
                    opacity: 0, 
                    x: i % 2 === 0 ? -50 : 50
                  }),
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { 
                      type: "tween",
                      duration: 0.6,
                      ease: "easeOut"
                    }
                  }
                }}
              >
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 ${category.accent} rounded-bl-full opacity-70`}></div>
                
                {/* Card content - centered for all screen sizes */}
                <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4">
                  {/* Icon with circular background */}
                  <div className={`${category.accent} p-2 sm:p-3 rounded-full mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="flex justify-center">
                      {category.icon}
                    </div>
                  </div>
                  
                  {/* Category name */}
                  <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 text-center group-hover:underline">{category.name}</h3>
                  
                  {/* Short description */}
                  <p className="text-xs opacity-80 text-center">{category.description}</p>
                  
                  {/* Explore text that appears on hover */}
                  <span className="mt-1 sm:mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-medium border-b border-current">
                    Explore →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CraftCategories;