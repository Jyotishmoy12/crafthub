import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, Heart } from "lucide-react";
import { FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="relative">
          {/* <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 transform -skew-y-2"></div> */}
        </div>

        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10 max-w-3xl mx-auto">
            <div className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                CraftHub
              </h3>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Empowering creativity through quality courses, supplies, and a supportive community of makers.
              </p>
              <div className="flex space-x-4 sm:space-x-5">
                <a href="https://www.facebook.com/pranabi.baruah" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                  <FaFacebook size={18} className="sm:w-5 sm:h-5" />
                </a>
                <a href="https://www.youtube.com/@pranabibaruah" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                  <FaYoutube size={18} className="sm:w-5 sm:h-5" />
                </a>
                <a href="https://www.instagram.com/pranabibaruah/?igsh=c3cxNzI4azZzNDcz#" className="text-gray-400 hover:text-indigo-400 transition-all transform hover:-translate-y-1">
                  <Instagram size={18} className="sm:w-5 sm:h-5" />
                </a>

                </div>
            </div>

            <div className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Contact Us
              </h3>
              <ul className="space-y-3 sm:space-y-5">
                <li className="flex items-start group">
                  <div className="bg-indigo-500/20 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:bg-indigo-500/40 transition-all">
                    <MapPin size={16} className="text-indigo-300 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-gray-300 text-sm sm:text-base mt-0 sm:mt-1">Christian Basti G S Road
                  Guwahati 5</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-indigo-500/20 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:bg-indigo-500/40 transition-all">
                    <Phone size={16} className="text-indigo-300 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-gray-300 text-sm sm:text-base mt-0 sm:mt-1">+917002970138</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-indigo-500/20 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:bg-indigo-500/40 transition-all">
                    <Mail size={16} className="text-indigo-300 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-gray-300 text-sm sm:text-base mt-0 sm:mt-1">baruahpranabi@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-gray-700/50 my-6 sm:my-12" />

        <div className="flex flex-col sm:flex-row justify-between sm:justify-center items-center sm:space-x-16">
          <div className="flex flex-col space-y-2 sm:space-y-4 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">© 2025 CraftHub. All rights reserved.</p>
            <p className="text-gray-300 flex items-center justify-center text-xs sm:text-sm">
              Made with <Heart size={14} className="mx-1 text-pink-500 animate-pulse" /> by
              <a 
                href="https://www.linkedin.com/in/jyotishmoy-deka-6871b9229/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300 transition-all"
              >
                Jyotishmoy
              </a>
              
            </p>
            <span className="text-gray-300 flex items-center justify-center text-xs sm:text-sm">Made in Assam</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-indigo-300 text-xs sm:text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-indigo-300 text-xs sm:text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookie-policy" className="text-gray-400 hover:text-indigo-300 text-xs sm:text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
