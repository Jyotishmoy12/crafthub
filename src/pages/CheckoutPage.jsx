import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const CheckoutPage = () => {
  // Extract both user and loading flag from auth hook.
  const [user, loadingUser] = useAuthState(auth);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Razorpay configuration
  const RAZORPAY_KEY_ID =import.meta.env.VITE_RAZORPAY_KEY_ID // Replace with your actual key
  const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET; // Replace with your actual secret

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().catch(error => {
      console.error('Failed to load Razorpay script', error);
      toast.error('Payment gateway loading failed');
    });

    // Wait for the auth state to finish loading.
    if (!loadingUser && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      const fetchCartItems = async () => {
        try {
          const cartItemsRef = collection(db, 'carts', user.uid, 'items');
          const cartSnapshot = await getDocs(cartItemsRef);
          // If the subcollection is empty, inform the user and redirect.
          if (cartSnapshot.empty) {
            toast.error('Your cart is empty');
            navigate('/products');
            return;
          }
          const items = cartSnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setCartItems(items);
          setLoading(false);
        } catch (error) {
          toast.error('Error fetching cart items');
          setLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [user, loadingUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const initiateRazorpayPayment = () => {
    // Validate form first
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Create payment options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: 'INR',
      name: 'Your Store Name',
      description: 'Product Purchase',
      image: 'https://your-logo-url.com/logo.png', // Optional: Your company logo
      handler: async function (response) {
        try {
          // Verify payment on client-side (Note: This is not secure and should be done server-side in a real app)
          // In a production scenario, you'd verify this with a backend service
          if (response.razorpay_payment_id) {
            // Create order in Firestore
            const orderRef = await addDoc(collection(db, 'orders'), {
              userId: user.uid,
              items: cartItems,
              total: totalPrice,
              shippingInfo: formData,
              paymentInfo: {
                razorpayPaymentId: response.razorpay_payment_id,
                status: 'success'
              },
              status: 'processing',
              createdAt: new Date()
            });

            // Clear the cart by deleting each item document.
            const batch = cartItems.map(item => 
              deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
            );
            await Promise.all(batch);

            toast.success("Order placed successfully");
            navigate(`/order-confirmation/${orderRef.id}`);
          }
        } catch (error) {
          toast.error('Order processing failed');
          console.error(error);
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone
      },
      notes: {
        address: formData.address
      },
      theme: {
        color: '#3399cc'
      }
    };

    // Open Razorpay checkout
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  if (loading || loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 my-30">
            <h2 className="text-2xl font-bold mb-6 flex items-center ">
              <ShoppingCart className="mr-3 text-blue-600" />
              Order Summary
            </h2>
            
            {cartItems.map(item => (
              <div 
                key={item.id} 
                className="flex justify-between items-center border-b py-4"
              >
                <div className="flex items-center">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded mr-4" 
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-500">₹{item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            
            <div className="mt-6 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:my-30">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CreditCard className="mr-3 text-blue-600" />
              Checkout Details
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              initiateRazorpayPayment();
            }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
                
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle2 className="mr-2" />
                Pay Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CheckoutPage;