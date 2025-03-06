import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
// First make sure to install the package: npm install jspdf-autotable
import 'jspdf-autotable';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageObjects, setImageObjects] = useState([]);

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

  // Preload images when orderDetails are available
  useEffect(() => {
    if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
      const images = [];
      let loadedCount = 0;
      
      orderDetails.items.forEach((item, index) => {
        if (item.image) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';  // This helps with CORS issues
          img.onload = () => {
            loadedCount++;
            if (loadedCount === orderDetails.items.filter(i => i.image).length) {
              setImagesLoaded(true);
            }
          };
          img.onerror = () => {
            console.error(`Failed to load image for ${item.name}`);
            loadedCount++;
            if (loadedCount === orderDetails.items.filter(i => i.image).length) {
              setImagesLoaded(true);
            }
          };
          img.src = item.image;
          images.push({ index, img });
        }
      });
      
      setImageObjects(images);
      
      // If no images to load, set imagesLoaded to true
      if (images.length === 0) {
        setImagesLoaded(true);
      }
    }
  }, [orderDetails]);

  // Calculate total number of items from order items.
  const totalItems = orderDetails?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Helper function to convert image to Data URL
  const getBase64FromImg = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };

  const downloadPDF = () => {
    if (!orderDetails) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    try {
      // Add company logo (uncomment and replace with your actual logo)
      // doc.addImage('company_logo.png', 'PNG', 10, 10, 40, 20);
      
      // Set background color for header
      doc.setFillColor(41, 98, 255);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Add header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("ORDER CONFIRMATION", 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text("Thank you for your purchase!", 105, 32, { align: 'center' });
      
      // Set up document body
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Order info section with styled box
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 45, 190, 40, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 45, 190, 40, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.text("ORDER DETAILS", 15, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order ID: ${orderId}`, 15, 65);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 75);
      
      // Customer section
      doc.setFont('helvetica', 'bold');
      doc.text("SELLER INFORMATION", 120, 55);
      doc.setFont('helvetica', 'normal');
      doc.text("Contact: 6000460553", 120, 65);
      doc.text("Email: jyotishmoydeka62@gmail.com", 120, 75);
      
      // Order summary section with styled box
      doc.setFillColor(41, 98, 255, 0.1);
      doc.rect(10, 90, 190, 25, 'F');
      doc.setDrawColor(41, 98, 255, 0.5);
      doc.rect(10, 90, 190, 25, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.text("ORDER SUMMARY", 105, 100, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Items: ${totalItems}`, 65, 110);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: ₹${orderDetails.total.toFixed(2)}`, 150, 110);
      doc.setFontSize(12);

      // Add a "Your Order" heading
      doc.setFont('helvetica', 'bold');
      doc.text("YOUR ORDER", 105, 125, { align: 'center' });
      
      let yPosition = 135;
      
      // Item details with images
      orderDetails.items.forEach((item, index) => {
        const itemBox = {
          x: 10,
          y: yPosition,
          width: 190,
          height: 60
        };
        
        // Add box around item
        doc.setFillColor(250, 250, 250);
        doc.rect(itemBox.x, itemBox.y, itemBox.width, itemBox.height, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(itemBox.x, itemBox.y, itemBox.width, itemBox.height, 'S');

        // Find matching image if available
        const imageObject = imageObjects.find(img => img.index === index);
        
        if (imageObject && imagesLoaded) {
          try {
            // Try to add the image - handle any potential errors
            const dataUrl = getBase64FromImg(imageObject.img);
            doc.addImage(dataUrl, 'JPEG', itemBox.x + 5, itemBox.y + 5, 50, 50);
          } catch (err) {
            console.error('Error adding image to PDF:', err);
            // Draw placeholder if image fails
            doc.setFillColor(200, 200, 200);
            doc.rect(itemBox.x + 5, itemBox.y + 5, 50, 50, 'F');
            doc.setTextColor(150, 150, 150);
            doc.text("No Image", itemBox.x + 30, itemBox.y + 30, { align: 'center' });
          }
        } else {
          // Draw placeholder if no image
          doc.setFillColor(200, 200, 200);
          doc.rect(itemBox.x + 5, itemBox.y + 5, 50, 50, 'F');
          doc.setTextColor(150, 150, 150);
          doc.text("No Image", itemBox.x + 30, itemBox.y + 30, { align: 'center' });
        }
        
        // Add item details
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'bold');
        doc.text(item.name, itemBox.x + 65, itemBox.y + 15);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Quantity: ${item.quantity}`, itemBox.x + 65, itemBox.y + 25);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Price: ₹${item.price.toFixed(2)}`, itemBox.x + 65, itemBox.y + 35);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: ₹${(item.price * item.quantity).toFixed(2)}`, itemBox.x + 65, itemBox.y + 45);
        
        // Update position for next item
        yPosition += itemBox.height + 10;
        
        // Add a new page if needed
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Add decorative bottom border
      doc.setDrawColor(41, 98, 255);
      doc.setLineWidth(2);
      yPosition += 5;
      doc.line(10, yPosition, 200, yPosition);
      
      // Add footer text
      yPosition += 15;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text("We appreciate your business. If you have any questions about your order,", 105, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text("please contact us using the information provided above.", 105, yPosition + 5, { align: 'center' });
      
      // Footer with decoration on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Add decorative footer
        doc.setFillColor(41, 98, 255);
        doc.rect(0, doc.internal.pageSize.height - 20, 210, 20, 'F');
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("© 2025 CraftHub. All rights reserved.", 105, doc.internal.pageSize.height - 10, { align: 'center' });
        
        // Add page numbers
        doc.text(`Page ${i} of ${pageCount}`, 185, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF with the order ID
      doc.save(`Order_${orderId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Fallback to simple PDF if the enhanced version fails
      createSimplePDF();
    }
  };

  // Fallback function for simple PDF generation
  const createSimplePDF = () => {
    if (!orderDetails) return;
    
    const doc = new jsPDF();
    
    // Simple header
    doc.setFontSize(20);
    doc.text("Order Confirmation", 105, 20, { align: 'center' });
    
    // Order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 40);
    doc.text(`Total Price: ₹${orderDetails.total.toFixed(2)}`, 20, 50);
    doc.text(`Total Items: ${totalItems}`, 20, 60);
    doc.text(`Seller Contact: 6000460553`, 20, 70);
    doc.text(`Seller Email: jyotishmoydeka62@gmail.com`, 20, 80);
    
    // List items
    let yPos = 100;
    doc.text("Order Items:", 20, yPos);
    yPos += 10;
    
    orderDetails.items.forEach((item, index) => {
      doc.text(`Item ${index + 1}: ${item.name}`, 20, yPos);
      doc.text(`Quantity: ${item.quantity}`, 20, yPos + 10);
      doc.text(`Price: ₹${item.price.toFixed(2)}`, 20, yPos + 20);
      yPos += 30;
    });
    
    // Thank you note
    doc.text("Thank you for your purchase!", 105, yPos, { align: 'center' });
    
    // Save the PDF
    doc.save(`Order_${orderId}.pdf`);
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