import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Search, Star } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';

// ----------------------------------
// RatingStars Component (unchanged)
// ----------------------------------
const RatingStars = ({ productId, currentAverageRating, onRatingSubmit, isAuthenticated, userRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(userRating || 0);

  useEffect(() => {
    if (userRating != null) {
      setSelectedRating(userRating);
    }
  }, [userRating]);

  const handleClick = (rating) => {
    if (!isAuthenticated || userRating != null) return;
    setSelectedRating(rating);
    onRatingSubmit(rating);
  };

  return (
    <div className="flex flex-col mt-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              (hoverRating >= star || selectedRating >= star)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${userRating != null ? 'cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
      {userRating != null ? (
        <span className="text-xs text-green-600 mt-1">
          Your rating: {userRating} {userRating > 1 ? 'stars' : 'star'}
        </span>
      ) : !isAuthenticated ? (
        <span className="text-xs text-gray-500 mt-1">Login to rate</span>
      ) : null}
    </div>
  );
};

// ----------------------------------
// ProductsPage Component
// ----------------------------------
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [user, loadingUser] = useAuthState(auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          price: parseFloat(docSnap.data().price || 0),
          originalPrice: parseFloat(docSnap.data().originalPrice || 0),
          averageRating: parseFloat(docSnap.data().averageRating || 0),
          ratingsCount: parseInt(docSnap.data().ratingsCount || 0)
        }));
        
        // If user is logged in, fetch user-specific ratings
        if (user) {
          const productsWithUserRating = await Promise.all(
            productList.map(async (product) => {
              const ratingDocRef = doc(db, 'products', product.id, 'ratings', user.uid);
              const ratingDocSnap = await getDoc(ratingDocRef);
              return ratingDocSnap.exists()
                ? { ...product, userRating: ratingDocSnap.data().rating }
                : { ...product, userRating: null };
            })
          );
          setProducts(productsWithUserRating);
        } else {
          setProducts(productList);
        }
        setLoadingProducts(false);
      } catch (error) {
        toast.error('Failed to fetch products');
        setLoadingProducts(false);
      }
    };
    
    if (!loadingUser) {
      fetchProducts();
    }
  }, [user, loadingUser]);

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    try {
      const cartItemRef = doc(db, 'carts', user.uid, 'items', product.id);
      const cartItemSnap = await getDoc(cartItemRef);
      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          quantity: cartItemSnap.data().quantity + 1
        });
      } else {
        await setDoc(cartItemRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          // Use the first image from the images array as the cover photo
          image: (product.images && product.images.length > 0)
            ? product.images[0]
            : product.image || '',
          quantity: 1
        });
      }
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = (product) => {
    if (!user) {
      toast.error("Please log in to make a purchase");
      navigate('/auth');
      return;
    }
    if (!product.inStock) {
      toast.error("This product is currently out of stock");
      return;
    }
    navigate('/checkout', { 
      state: { 
        buyNowProduct: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: (product.images && product.images.length > 0)
            ? product.images[0]
            : product.image || '',
        } 
      }
    });
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleRatingSubmit = async (productId, rating) => {
    try {
      if (!user) return;
      const ratingDocRef = doc(db, 'products', productId, 'ratings', user.uid);
      const ratingDocSnap = await getDoc(ratingDocRef);
      if (ratingDocSnap.exists()) return; // user already rated

      const product = products.find(p => p.id === productId);
      const currentCount = product.ratingsCount || 0;
      const currentAverage = product.averageRating || 0;
      const newCount = currentCount + 1;
      const newSum = (currentAverage * currentCount) + rating;
      const newAverage = newSum / newCount;
      
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        averageRating: newAverage,
        ratingsCount: newCount
      });
      await setDoc(ratingDocRef, { rating });
      
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId
            ? { ...p, averageRating: newAverage, ratingsCount: newCount, userRating: rating }
            : p
        )
      );
      
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingProducts || loadingUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 my-20">
              Discover Our Products
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our carefully curated collection of high-quality products.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Product List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No products found</p>
            </div>
          ) : (
            // Always 2 columns
            <div className="grid grid-cols-2 gap-6">
              {filteredProducts.map((product) => {
                // Calculate discount (if needed)
                const hasDiscount = product.originalPrice > product.price;
                const discountPercent = hasDiscount
                  ? Math.round(100 - (product.price / product.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col md:flex-row gap-4 p-2 md:p-4 border rounded-lg bg-white"
                  >
                    {/* Image (clickable for all screen sizes) */}
                    <div
                      className="relative cursor-pointer w-full h-36 md:w-32 md:h-32 flex-shrink-0"
                      onClick={() => handleViewDetails(product.id)}
                    >
                      <img
                        src={(product.images && product.images.length > 0)
                              ? product.images[0]
                              : product.image || ''}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {!product.inStock && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col flex-1 justify-between">
                      {/* Big Screens (md+) */}
                      <div className="hidden md:block">
                        <h2
                          className="text-md font-bold cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewDetails(product.id)}
                        >
                          {product.name}
                        </h2>

                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {product.averageRating.toFixed(1)} ({product.ratingsCount})
                          </span>
                        </div>

                        <div className="mt-2">
                          <span className="text-base font-bold text-gray-800">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>

                        <RatingStars
                          productId={product.id}
                          currentAverageRating={product.averageRating}
                          onRatingSubmit={(rating) => handleRatingSubmit(product.id, rating)}
                          isAuthenticated={!!user}
                          userRating={product.userRating}
                        />

                        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                          {product.description}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className={`px-2 py-1 text-sm md:px-3 md:py-2 rounded-md transition-colors ${
                              !product.inStock
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-600'
                            }`}
                          >
                            Add to Cart
                          </button>

                          <button
                            onClick={() => handleBuyNow(product)}
                            disabled={!product.inStock}
                            className={`px-2 py-1 text-sm md:px-3 md:py-2 rounded-md transition-colors ${
                              !product.inStock
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Buy Now
                          </button>

                          <button
                            onClick={() => handleViewDetails(product.id)}
                            className="px-2 py-1 text-sm md:px-3 md:py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Small Screens (<md) */}
                      <div className="block md:hidden">
                        <h2 className="text-md font-bold">
                          {product.name}
                        </h2>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-600">
                              {product.averageRating.toFixed(1)} ({product.ratingsCount})
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-base font-bold text-gray-800">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                          {product.description}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className={`px-2 py-1 text-sm rounded-md transition-colors ${
                              !product.inStock
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-600'
                            }`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsPage;
