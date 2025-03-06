import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort orders by date (newest first)
          // Handle both Firestore timestamps and regular date strings/objects
          ordersData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return dateB - dateA;
          });
          
          setOrders(ordersData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error('Failed to fetch orders', { 
            icon: '❌',
            style: { background: '#FEE2E2', color: '#B91C1C' },
          });
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, loadingUser, navigate]);

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  const getStatusColor = (status) => {
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Fixed formatDate function to handle different timestamp formats
  const formatDate = (timestamp) => {
    try {
      // Handle Firestore timestamp objects which have a toDate() method
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  if (loading || loadingUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-500 mt-1">View and track all your orders in one place</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="mt-4 text-xl font-medium text-gray-900">No orders yet</h2>
                <p className="mt-2 text-gray-500">You haven't placed any orders with us yet.</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(-8)}</h2>
                          {order.paymentInfo && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentInfo.status)}`}>
                              {order.paymentInfo.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.createdAt ? `Placed on ${formatDate(order.createdAt)}` : 'Date unavailable'}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center">
                        <span className="text-xl font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                          <div className="space-y-3">
                            {order.items && order.items.map((item, index) => (
                              <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                                    <p>Qty: {item.quantity}</p>
                                    <p>₹{item.price.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Shipping Details</h3>
                            {order.shippingInfo ? (
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-900">{order.shippingInfo.fullName}</p>
                                <p>{order.shippingInfo.address}</p>
                                <p>{order.shippingInfo.city}, {order.shippingInfo.state} - {order.shippingInfo.zipCode}</p>
                                <p className="flex items-center mt-2">
                                  <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {order.shippingInfo.phone}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No shipping information available</p>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Payment Information</h3>
                            {order.paymentInfo ? (
                              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p><span className="text-gray-500">Payment ID:</span> <span className="font-mono">{order.paymentInfo.razorpayPaymentId}</span></p>
                                <p className="flex justify-between">
                                  <span className="text-gray-500">Status:</span> 
                                  <span className={`font-medium ${
                                    order.paymentInfo.status.toLowerCase() === 'completed' ? 'text-green-600' : 
                                    order.paymentInfo.status.toLowerCase() === 'pending' ? 'text-yellow-600' : 'text-gray-900'
                                  }`}>
                                    {order.paymentInfo.status}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No payment information available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-500">Total Items:</span> 
                        <span className="ml-1 font-medium">
                          {order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;