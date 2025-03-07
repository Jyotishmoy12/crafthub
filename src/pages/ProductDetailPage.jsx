import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Package, 
  Truck, 
  Shield, 
  Star, 
  ShoppingCart, 
  CreditCard 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';

/* -------------------------------
   ImageCarousel Component
   -------------------------------
   This component accepts an array of image URLs and displays
   them in a carousel with next/prev navigation and thumbnails.
---------------------------------- */
const ImageCarousel = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <img 
        src={images[currentIndex]} 
        alt={alt} 
        className="w-full max-h-96 object-contain rounded-lg" 
      />
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextImage} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((img, index) => (
            <img 
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${index === currentIndex ? 'border-blue-600' : 'border-transparent'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------
   RatingStars Component (unchanged)
---------------------------------- */
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
            className={`w-6 h-6 cursor-pointer transition-colors ${
              (hoverRating >= star || selectedRating >= star)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${userRating != null ? 'cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
      {userRating != null ? (
        <span className="text-sm text-green-600 mt-1">
          Your rating: {userRating} {userRating > 1 ? 'stars' : 'star'}
        </span>
      ) : !isAuthenticated ? (
        <span className="text-sm text-gray-500 mt-1">Login to rate</span>
      ) : null}
    </div>
  );
};

/* -------------------------------
   ProductDetailPage Component
---------------------------------- */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, loadingUser] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!productId) return;
        
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          toast.error('Product not found');
          navigate('/products');
          return;
        }
        
        const productData = {
          id: productSnap.id,
          ...productSnap.data(),
          price: parseFloat(productSnap.data().price || 0),
          originalPrice: parseFloat(productSnap.data().originalPrice || 0),
          averageRating: parseFloat(productSnap.data().averageRating || 0),
          ratingsCount: parseInt(productSnap.data().ratingsCount || 0)
        };
        
        // Fetch user rating if logged in
        if (user) {
          const ratingDocRef = doc(db, 'products', productId, 'ratings', user.uid);
          const ratingDocSnap = await getDoc(ratingDocRef);
          if (ratingDocSnap.exists()) {
            setUserRating(ratingDocSnap.data().rating);
          }
        }
        
        // Fetch reviews (ratings with comments)
        const reviewsCollection = collection(db, 'products', productId, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        const reviewsList = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setProduct(productData);
        setReviews(reviewsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
        setLoading(false);
      }
    };
    
    if (!loadingUser) {
      fetchProductDetails();
    }
  }, [productId, user, loadingUser, navigate]);
  
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    
    if (!product.inStock) {
      toast.error("This product is currently out of stock");
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
          // Use cover image from images array if available
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
  
  const handleBuyNow = () => {
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
  
  const handleRatingSubmit = async (rating) => {
    try {
      if (!user) return;
      
      const productRef = doc(db, 'products', productId);
      const ratingDocRef = doc(db, 'products', productId, 'ratings', user.uid);
      const ratingDocSnap = await getDoc(ratingDocRef);
      
      if (ratingDocSnap.exists()) return;
      
      const currentCount = product.ratingsCount || 0;
      const currentAverage = product.averageRating || 0;
      const newCount = currentCount + 1;
      const newSum = (currentAverage * currentCount) + rating;
      const newAverage = newSum / newCount;
      
      await updateDoc(productRef, {
        averageRating: newAverage,
        ratingsCount: newCount
      });
      
      await setDoc(ratingDocRef, { rating });
      
      setProduct({
        ...product,
        averageRating: newAverage,
        ratingsCount: newCount
      });
      
      setUserRating(rating);
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (loading || loadingUser) {
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
  
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button 
            onClick={goBack}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
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
          <button 
            onClick={goBack} 
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image Carousel */}
              <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <ImageCarousel images={product.images} alt={product.name} />
                ) : (
                  <img 
                    src={product.image || ''} 
                    alt={product.name} 
                    className="max-h-96 object-contain rounded-lg"
                  />
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="text-lg text-gray-600 font-medium">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.ratingsCount} {product.ratingsCount === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="ml-3 text-lg line-through text-gray-500">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.originalPrice > product.price && (
                    <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{product.description}</p>
                
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Rate this product */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Rate this product</h3>
                  <RatingStars 
                    productId={product.id}
                    currentAverageRating={product.averageRating}
                    onRatingSubmit={handleRatingSubmit}
                    isAuthenticated={!!user}
                    userRating={userRating}
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-4 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg transition-colors ${
                      !product.inStock
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-600'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg transition-colors ${
                      !product.inStock
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Product Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <Clock className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">Delivery Estimate</h3>
                    <p className="text-gray-600">
                      {product.deliveryEstimate || '5-9 business days'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <Package className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">Package Contains</h3>
                    <p className="text-gray-600">
                      {product.packageContains || '1 x Product, User Manual'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">Warranty</h3>
                    <p className="text-gray-600">
                      {product.warranty || '1 Year Manufacturer Warranty'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Specifications Section */}
            {product.specifications && (
              <div className="mt-12 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(product.specifications || {}).map(([key, value], index) => (
                        <tr key={key} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}>
                          <td className="py-3 px-4 font-medium">{key}</td>
                          <td className="py-3 px-4 text-gray-700">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
