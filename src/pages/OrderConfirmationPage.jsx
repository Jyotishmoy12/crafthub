// OrderConfirmationPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <CheckCircle className="mx-auto text-green-500" size={48} />
          <h1 className="text-2xl font-bold mt-4">Order Confirmed!</h1>
          <p className="mt-2 text-gray-600">
            Your order has been successfully placed.
          </p>
          <p className="mt-2 text-gray-600">
            Order ID: <span className="font-bold">{orderId}</span>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
