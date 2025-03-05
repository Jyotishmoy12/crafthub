import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, loadingUser] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth state has finished loading and no user is logged in.
    if (!loadingUser && !user) {
      navigate("/auth");
      return;
    }
    // Only fetch cart items if user is available.
    if (user) {
      const fetchCartItems = async () => {
        try {
          const cartItemsRef = collection(db, 'carts', user.uid, 'items');
          const cartSnapshot = await getDocs(cartItemsRef);
          const items = cartSnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setCartItems(items);
          setLoading(false);
        } catch (error) {
          toast.error("Failed to load cart items");
          setLoading(false);
        }
      };
      fetchCartItems();
    }
  }, [user, loadingUser, navigate]);

  const handleUpdateQuantity = async (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await handleRemoveItem(item.id);
      toast.success("Item removed from cart");
    } else {
      try {
        const itemRef = doc(db, 'carts', user.uid, 'items', item.id);
        await updateDoc(itemRef, { quantity: newQuantity });
        setCartItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i)
        );
        toast.success("Quantity updated");
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'carts', user.uid, 'items', itemId));
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // Navigate to checkout page.
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate('/checkout');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center">
                <ShoppingCart className="mr-3 text-blue-600" />
                Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </h1>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">Your cart is empty</p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex flex-col sm:flex-row items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 w-full sm:w-1/2">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg shadow-sm" 
                        />
                        <div>
                          <h2 className="text-lg font-semibold">{item.name}</h2>
                          <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item, -1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="px-4 text-lg font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item, 1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-100 text-right">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-600">Total Items: {totalItems}</p>
                    <h2 className="text-2xl font-bold">
                      Total: <span className="text-blue-600">₹{totalPrice.toFixed(2)}</span>
                    </h2>
                  </div>
                  <button 
                    onClick={handleProceedToCheckout}
                    className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
