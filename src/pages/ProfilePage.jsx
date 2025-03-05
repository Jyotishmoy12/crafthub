// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

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
          setOrders(ordersData);
          setLoading(false);
        } catch (error) {
          toast.error('Failed to fetch orders');
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, loadingUser, navigate]);

  if (loading || loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>
          {orders.length === 0 ? (
            <p className="text-center text-gray-600">You haven't placed any orders yet.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Order ID: {order.id}</h2>
                <p className="text-gray-600 mb-1">
                  <strong>Total Price:</strong> ₹{order.total.toFixed(2)}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Items Ordered:</strong>{' '}
                  {order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Items:</h3>
                  {order.items &&
                    order.items.map((item, index) => (
                      <div key={index} className="flex items-center border-b py-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded mr-4"
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Shipping Details:</h3>
                  {order.shippingInfo && (
                    <div className="text-gray-600">
                      <p>
                        <strong>Name:</strong> {order.shippingInfo.fullName}
                      </p>
                      <p>
                        <strong>Address:</strong>{' '}
                        {order.shippingInfo.address}, {order.shippingInfo.city},{' '}
                        {order.shippingInfo.state} - {order.shippingInfo.zipCode}
                      </p>
                      <p>
                        <strong>Contact:</strong> {order.shippingInfo.phone}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Payment Information:</h3>
                  {order.paymentInfo && (
                    <div className="text-gray-600">
                      <p>
                        <strong>Payment ID:</strong> {order.paymentInfo.razorpayPaymentId}
                      </p>
                      <p>
                        <strong>Status:</strong> {order.paymentInfo.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
