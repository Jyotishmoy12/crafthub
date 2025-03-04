import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { collection, getDocs, getDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

// Compact RatingStars component with userRating display.
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
        {[1,2,3,4,5].map((star) => (
          <svg
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              (hoverRating >= star || selectedRating >= star) ? 'text-yellow-400' : 'text-gray-300'
            } ${userRating != null && 'cursor-not-allowed'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.951c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.951a1 1 0 00-.364-1.118L2.07 9.377c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z" />
          </svg>
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

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  const handleRatingSubmit = async (productId, rating) => {
    try {
      if (!user) return;
      const productRef = doc(db, 'products', productId);
      const ratingDocRef = doc(db, 'products', productId, 'ratings', user.uid);
      const ratingDocSnap = await getDoc(ratingDocRef);
      if (ratingDocSnap.exists()) return;
      
      const product = products.find(p => p.id === productId);
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
      
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId
            ? { ...p, averageRating: newAverage, ratingsCount: newCount, userRating: rating }
            : p
        )
      );
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p>Loading products...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            All Products
          </h1>
          {/* Compact search bar with icon */}
          <div className="mb-6 flex items-center border border-gray-300 rounded-lg overflow-hidden max-w-md mx-auto my-20">
            <div className="px-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-2 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={product.image || ''}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold">{product.name}</h2>
                  <p className="mt-2 text-gray-600">{product.description}</p>
                  <div className="mt-4">
                    <span className="text-lg font-bold text-blue-800">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-sm line-through text-gray-500">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      Average Rating: {product.averageRating.toFixed(1)} ({product.ratingsCount} ratings)
                    </p>
                    <RatingStars 
                      productId={product.id}
                      currentAverageRating={product.averageRating}
                      onRatingSubmit={(rating) => handleRatingSubmit(product.id, rating)}
                      isAuthenticated={!!user}
                      userRating={product.userRating}
                    />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => console.log(`Adding product ${product.id} to cart`)}
                      disabled={!product.inStock}
                      className={`px-4 py-2 rounded transition-colors ${
                        !product.inStock
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsPage;
