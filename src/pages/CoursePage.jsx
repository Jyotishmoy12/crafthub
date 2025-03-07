import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { toast, Toaster } from 'react-hot-toast';

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser; // Assumes the user is logged in

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch enrollments for the current user from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchEnrollments = async () => {
      try {
        const q = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const enrollmentList = querySnapshot.docs.map((doc) => doc.data());
        setEnrollments(enrollmentList);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };
    fetchEnrollments();
  }, [user]);

  // Check if the user is enrolled (i.e. payment done) in a given course
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId && enrollment.status === 'paid');
  };

  // Handle the enrollment payment via Razorpay and show WhatsApp modal on success
  const handlePayment = (course) => {
    if (!user) {
      alert("Please log in to enroll in courses.");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: course.price * 100, // in paise
      currency: "INR",
      name: course.title,
      description: "Purchase course",
      image: course.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Thumbnail',
      handler: async function (response) {
        try {
          // Generate an enrollment/order id using user uid and course id
          const enrollmentId = `${user.uid}_${course.id}`;
          // Save enrollment details in Firestore
          await setDoc(doc(db, "enrollments", enrollmentId), {
            userId: user.uid,
            courseId: course.id,
            status: 'paid',
            paymentId: response.razorpay_payment_id,
            createdAt: new Date()
          });
          // Update local enrollments state
          setEnrollments(prev => [...prev, { userId: user.uid, courseId: course.id, status: 'paid' }]);
          setOrderId(enrollmentId);

          // Construct WhatsApp message with enrollment details
          const message = `New Course Enrollment\n\nEnrollment ID: ${enrollmentId}\nCourse: ${course.title}\nPrice: ₹${course.price}\nPayment ID: ${response.razorpay_payment_id}\nName: ${user.displayName || ''}\nEmail: ${user.email}`;
          const adminNumber = '916000460553'; // Replace with your admin's phone number (without the +)
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const url = isMobile
            ? `whatsapp://send?phone=${adminNumber}&text=${encodeURIComponent(message)}`
            : `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

          // Set WhatsApp link and show modal
          setWhatsappLink(url);
          setShowWhatsAppModal(true);
          toast.success("Payment successful! Please send your enrollment details via WhatsApp.");
        } catch (error) {
          console.error("Error saving enrollment:", error);
          toast.error("Payment succeeded but there was an error saving your enrollment.");
        }
      },
      prefill: {
        name: user.displayName || "",
        email: user.email || "",
        contact: ""
      },
      notes: {
        course_id: course.id,
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const totalPrice = (course) => course.price; // For individual course



  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="flex flex-col items-center">
      {/* Spinner */}
      <svg
        className="animate-spin h-8 w-8 text-blue-500 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
      <p>Loading courses...</p>
    </div>
  </div>;
  if (!courses.length)
    return (
      <div className="text-center mt-12 text-xl font-semibold">
        No courses available.
      </div>
    );

  return (
    <>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center my-20">Courses</h1>
        <ul className="space-y-8">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex flex-col md:flex-row items-center gap-6 border p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={
                  course.thumbnailUrl ||
                  (course.videos && course.videos[0]?.thumbnailUrl) ||
                  'https://via.placeholder.com/300x200?text=No+Thumbnail'
                }
                alt={course.title}
                className="w-full md:w-48 h-32 md:h-40 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">{course.title}</h3>
                <p className="mt-2 text-gray-600">{course.description}</p>
                <p className="mt-2 font-bold text-lg">Price: ₹{course.price}</p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handlePayment(course)}
                    className={`inline-block text-white px-4 py-2 rounded transition ${isEnrolled(course.id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    disabled={isEnrolled(course.id)}
                  >
                    {isEnrolled(course.id) ? "Enrolled" : "Enroll"}
                  </button>
                  <button
                    onClick={() => navigate(`/coursedetails/${course.id}`)}
                    className={`inline-block text-white px-4 py-2 rounded transition ${!isEnrolled(course.id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                      }`}
                    disabled={!isEnrolled(course.id)}
                  >
                    Access Course
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />

      {/* WhatsApp Modal */}
      {showWhatsAppModal && whatsappLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold mb-4">Send Enrollment Details</h2>
            <p className="mb-6 text-gray-700">
              Your payment was successful. Tap the button below to send your enrollment details to our admin via WhatsApp.
            </p>
            <button
              onClick={() => {
                window.open(whatsappLink, '_blank');
                setShowWhatsAppModal(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Send via WhatsApp
            </button>
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="mt-4 text-sm text-gray-500 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursePage;
