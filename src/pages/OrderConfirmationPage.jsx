// OrderConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details from Firestore using orderId.
    const fetchOrderDetails = async () => {
      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDocSnap = await getDoc(orderDocRef);
        if (orderDocSnap.exists()) {
          setOrderDetails(orderDocSnap.data());
        } else {
          console.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Calculate total number of items from order items.
  const totalItems = orderDetails?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const downloadPDF = () => {
    if (!orderDetails) return;
    const docPDF = new jsPDF();

    // Header
    docPDF.setFontSize(20);
    docPDF.text("Order Confirmation", 20, 20);

    docPDF.setFontSize(12);
    docPDF.text(`Order ID: ${orderId}`, 20, 30);
    docPDF.text(`Total Price: ₹${orderDetails.total.toFixed(2)}`, 20, 40);
    docPDF.text(`Total Items: ${totalItems}`, 20, 50);
    docPDF.text(`Seller Contact: 6000460553`, 20, 60);
    docPDF.text(`Seller Email: jyotishmoydeka62@gmail.com`, 20, 70);

    // List each order item.
    let yOffset = 80;
    orderDetails.items.forEach((item, index) => {
      docPDF.text(`Item ${index + 1}: ${item.name}`, 20, yOffset);
      docPDF.text(`Quantity: ${item.quantity}`, 20, yOffset + 10);
      docPDF.text(`Price: ₹${item.price.toFixed(2)}`, 20, yOffset + 20);
      yOffset += 40;
    });

    // Save the PDF using the order id in the filename.
    docPDF.save(`Order_${orderId}.pdf`);
  };

  if (loading) {
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

  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-2xl text-gray-500">Order not found.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-3xl w-full my-30">
          <CheckCircle className="mx-auto text-green-500" size={48} />
          <h1 className="text-2xl font-bold mt-4">Order Confirmed!</h1>
          <div className="mt-4 text-left space-y-2">
            <p className="text-gray-600">
              <strong>Order ID:</strong> {orderId}
            </p>
            <p className="text-gray-600">
              <strong>Total Price:</strong> ₹{orderDetails.total.toFixed(2)}
            </p>
            <p className="text-gray-600">
              <strong>Total Items:</strong> {totalItems}
            </p>
            <div className="mt-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-gray-600 font-semibold">{item.name}</p>
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-gray-600">
                <strong>Seller Contact:</strong> 6000460553
              </p>
              <p className="text-gray-600">
                <strong>Seller Email:</strong> jyotishmoydeka62@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Download Order Details (PDF)
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
