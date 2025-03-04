import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  const goToProductsPage=()=>{
    navigate('/products');
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particles array
    let particlesArray = [];
    
    // Create craft-themed particle shapes
    class Particle {
      constructor() {
        this.size = Math.random() * 15 + 5;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = this.getRandomColor();
        this.shape = Math.floor(Math.random() * 5); // 0-4 different shapes
        this.alpha = Math.random() * 0.5 + 0.1;
        this.spin = 0;
        this.spinSpeed = Math.random() * 0.05 - 0.025;
      }
      
      getRandomColor() {
        const colors = [
          '#FF9AA2', // soft pink
          '#FFB7B2', // light coral
          '#FFDAC1', // peach
          '#E2F0CB', // light lime
          '#B5EAD7', // mint
          '#C7CEEA', // periwinkle
          '#F7D6E0'  // light rose
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.spin += this.spinSpeed;
        
        if (this.x > canvas.width + this.size || this.x < 0 - this.size) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height + this.size || this.y < 0 - this.size) {
          this.speedY = -this.speedY;
        }
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spin);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Draw different craft-themed shapes
        switch(this.shape) {
          case 0: // Circle (button)
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            break;
          case 1: // Square (fabric piece)
            ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
            break;
          case 2: // Triangle (folded paper)
            ctx.moveTo(0, -this.size/2);
            ctx.lineTo(-this.size/2, this.size/2);
            ctx.lineTo(this.size/2, this.size/2);
            ctx.closePath();
            break;
          case 3: // Diamond (gemstone)
            ctx.moveTo(0, -this.size/2);
            ctx.lineTo(this.size/2, 0);
            ctx.lineTo(0, this.size/2);
            ctx.lineTo(-this.size/2, 0);
            ctx.closePath();
            break;
          case 4: // Star (decoration)
            for (let i = 0; i < 5; i++) {
              ctx.lineTo(
                Math.cos((i * 72 + 36) * Math.PI / 180) * this.size/2,
                Math.sin((i * 72 + 36) * Math.PI / 180) * this.size/2
              );
              ctx.lineTo(
                Math.cos((i * 72) * Math.PI / 180) * this.size,
                Math.sin((i * 72) * Math.PI / 180) * this.size
              );
            }
            ctx.closePath();
            break;
          default:
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        }
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    
    // Initialize particles
    function init() {
      particlesArray = [];
      const numberOfParticles = Math.min(canvas.width, canvas.height) / 10;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animate);
    }
    
    // Handle resize
    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    }
    
    window.addEventListener('resize', handleResize);
    
    init();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animate);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden ">
      {/* Canvas background for animated craft elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)' }}
      />
      
      {/* Content */}
      <div className="container relative z-10 px-6 py-12 mx-auto my-25">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
              <span className="relative inline-block">
                <span className="relative z-10 font-semibold text-blue-700">নমস্কাৰ</span>
                <motion.span 
                  className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-200 -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                />
              </span>{" "}
              {" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-orange-600">স্বাগতম</span>
                <motion.span 
                  className="absolute -bottom-2 left-0 w-full h-3 bg-pink-200 -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                />
              </span>
            </h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              One Stop Solution for handcrafted courses and artisan supplies to unleash your creativity. 
              Join our community of makers, dreamers, and creators.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center md:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium relative overflow-hidden group">
                <span className="relative z-10 cursor-pointer">Explore Courses</span>
                <span className="absolute top-0 left-0 w-full h-0 bg-indigo-700 transition-all duration-300 group-hover:h-full -z-0"></span>
              </button>
              <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors duration-300 cursor-pointer" onClick={goToProductsPage}>
                Shop Supplies
              </button>
            </motion.div>
          </motion.div>
          
          {/* Creative Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Main circular display area */}
              <div className="relative bg-white rounded-full w-72 h-72 md:w-96 md:h-96 mx-auto shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white"></div>
                
                {/* Craft tools floating */}
                <motion.div 
                  className="absolute top-1/4 left-1/4 w-16 h-16"
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" className="w-full h-full">
                    <path d="M9 3L5 7M5 7L9 11M5 7H17M17 7L21 3M17 7L21 11M5 17L9 13M5 17L9 21M5 17H19M19 17L15 13M19 17L15 21" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-1/4 right-1/4 w-14 h-14"
                  animate={{ 
                    y: [0, 12, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" className="w-full h-full">
                    <path d="M14.5 3.5C14.5 3.5 14.5 5.5 12 5.5C9.5 5.5 9.5 3.5 9.5 3.5H7.5L4.5 6.5V9.5L11 16L13 16.5V21.5H21.5V16.5L15.5 10.5L19.5 6.5V3.5H14.5Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                
                <motion.div 
                  className="absolute top-1/3 right-1/4 w-12 h-12"
                  animate={{ 
                    x: [0, 10, 0],
                    rotate: [0, 15, 0]
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="w-full h-full">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3C9.5 7.5 7 9.5 3 12C7.5 14.5 9.5 17 12 21C14.5 17 17 14.5 21 12C17 9.5 14.5 7.5 12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-1/3 left-1/4 w-10 h-10"
                  animate={{ 
                    x: [0, -8, 0],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" className="w-full h-full">
                    <path d="M9 3H15M12 3V21M12 21H6M12 21H18" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>
              
              {/* Social Media Links */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute right-0 md:right-0 top-1/6 transform -translate-y-1/2 flex flex-col gap-4 z-50"
              >
                <a
                  href="https://www.facebook.com/pranabi.baruah" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 "
                  aria-label="Facebook"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaFacebook className="text-blue-600 text-xl md:text-2xl cursor-pointer z-50"/>
                </a>
                <a 
                  href="https://www.youtube.com/@pranabibaruah" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  aria-label="YouTube"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaYoutube className="text-red-600 text-xl md:text-2xl cursor-pointer" />
                </a>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-100 rounded-full -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-100 rounded-full -z-10"></div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-green-100 rounded-full -z-10"></div>
              <div className="absolute bottom-1/4 -left-10 w-20 h-20 bg-indigo-100 rounded-full -z-10"></div>
              
              {/* Thread strings */}
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,100 C50,50 150,50 200,100" fill="none" stroke="#f87171" strokeWidth="0.5" strokeDasharray="4 2"/>
                <path d="M0,120 C60,80 140,80 200,120" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="4 2"/>
                <path d="M0,80 C70,110 130,110 200,80" fill="none" stroke="#34d399" strokeWidth="0.5" strokeDasharray="4 2"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;