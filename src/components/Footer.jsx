import React from 'react';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Top Section with Organic Shape Separator */}
        <div className="relative">
          <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 transform -skew-y-2"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About with modern styling */}
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Craft Your Story</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering creativity through quality courses, supplies, and a supportive community of makers.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                <Facebook size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                <Twitter size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                <Instagram size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                <Linkedin size={22} />
              </a>
            </div>
          </div>
          
          {/* Quick Links with hover effects */}
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Quick Links</h3>
            <ul className="space-y-3">
              {['Courses', 'Supplies', 'Community', 'Events', 'Blog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white group flex items-center transition-all">
                    <span className="w-0 h-px bg-indigo-400 inline-block mr-0 group-hover:w-3 group-hover:mr-2 transition-all"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info with improved visuals */}
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start group">
                <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/40 transition-all">
                  <MapPin size={18} className="text-indigo-300" />
                </div>
                <span className="text-gray-300 mt-1">123 Craft Street, Artisan Valley, AV 12345</span>
              </li>
              <li className="flex items-start group">
                <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/40 transition-all">
                  <Phone size={18} className="text-indigo-300" />
                </div>
                <span className="text-gray-300 mt-1">(123) 456-7890</span>
              </li>
              <li className="flex items-start group">
                <div className="bg-indigo-500/20 p-2 rounded-lg mr-3 group-hover:bg-indigo-500/40 transition-all">
                  <Mail size={18} className="text-indigo-300" />
                </div>
                <span className="text-gray-300 mt-1">hello@craftyourstory.com</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter with modern design */}
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Stay Updated</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">Subscribe for the latest craft trends and exclusive offers.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-4 py-3 bg-gray-800/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button className="absolute right-1 top-1 bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-700/50 my-12" />
        
        {/* Bottom section with made with love */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col space-y-4">
            <p className="text-gray-400 text-sm">© 2025 Craft Your Story. All rights reserved.</p>
            <p className="text-gray-300 flex items-center text-sm">
              Made with <Heart size={16} className="mx-1 text-pink-500 animate-pulse" /> by 
              <a 
                href="https://linkedin.com/in/jyotishmoy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300 transition-all"
              >
                Jyotishmoy
              </a>
            </p>
          </div>
          <div className="flex space-x-6 mt-6 md:mt-0">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 text-sm transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;