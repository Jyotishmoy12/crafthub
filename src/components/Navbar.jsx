// Navbar.jsx (modified snippet)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import app, { db } from '../../firebaseConfig';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for auth changes and update admin state if needed
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === 'pranabibaruah@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch the cart count for the logged in user (if any)
  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        try {
          const cartItemsRef = collection(db, 'carts', user.uid, 'items');
          const cartSnapshot = await getDocs(cartItemsRef);
          let count = 0;
          cartSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            count += data.quantity || 0;
          });
          setCartCount(count);
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      };
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Navigation functions
  const moveToAuth = () => {
    navigate('/auth');
  };

  const goToAdminDashboard = () => {
    if (isAdmin) {
      navigate('/admin-dashboard');
    }
  };

  const logoutUser = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Listen for scroll events to add a shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-4'}`}
        style={{ backgroundColor: 'white' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="flex items-center">
                  <span className="ml-2 text-lg md:text-2xl font-bold text-blue-700">
                    <span className="text-orange-600">CraftHub</span> by Pranabi Baruah
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block flex-grow">
              <div className="flex justify-center">
                <div className="ml-10 flex items-center space-x-8">
                  {['Courses', 'Products'].map((item) => (
                    <motion.a
                      key={item}
                      href={`/${item.toLowerCase()}`}
                      className="text-neutral hover:text-blue-700 font-medium text-xl"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin && (
                <motion.button
                  onClick={goToAdminDashboard}
                  className="px-4 py-2 rounded-md text-white font-medium bg-red-600 hover:bg-red-700"
                >
                  Admin Dashboard
                </motion.button>
              )}

              {/* Cart Icon only on /products route */}
              {location.pathname === '/products' && (
                <div className="relative">
                  <motion.button
                    onClick={() => user ? navigate('/cart') : moveToAuth()}
                    className="p-2"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                      />
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                    </svg>
                  </motion.button>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {cartCount}
                    </span>
                  )}
                </div>
              )}

              {/* Auth Button */}
              {user ? (
                <motion.button
                  onClick={logoutUser}
                  className="px-4 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  Logout
                </motion.button>
              ) : (
                <motion.button
                  onClick={moveToAuth}
                  className="px-4 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  Login
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Items */}
        <motion.div
          className="md:hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            {['Courses', 'Products'].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {item}
              </a>
            ))}
            <div className="flex items-center space-x-4 mt-2">
              {location.pathname === '/products' && (
                <div className="relative">
                  <motion.button
                    onClick={() => user ? navigate('/cart') : moveToAuth()}
                    className="p-2"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                      />
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                    </svg>
                  </motion.button>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {cartCount}
                    </span>
                  )}
                </div>
              )}
              {user ? (
                <motion.button
                  onClick={logoutUser}
                  className="w-full px-4 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </motion.button>
              ) : (
                <motion.button
                  onClick={moveToAuth}
                  className="w-full px-4 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login
                </motion.button>
              )}
              {isAdmin && (
                <motion.button
                  onClick={goToAdminDashboard}
                  className="w-full px-4 py-2 rounded-md text-white font-medium bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Admin Dashboard
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
};

export default Navbar;
