import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// Loader component with a spinning animation
const Loader = () => (
  <div className="flex flex-col items-center justify-center mt-12">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500"></div>
    <p className="mt-4 text-xl font-semibold text-blue-500">Loading courses...</p>
  </div>
);

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // user enrollments from Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser; // Assumes the user is logged in

  // Load the Razorpay checkout script dynamically
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
    if (!user) return; // if not logged in, skip fetching enrollments
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

  // Check if the user is enrolled in a given course (i.e. payment done)
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId && enrollment.status === 'paid');
  };

  // Handle the enrollment payment via Razorpay
  const handlePayment = (course) => {
    if (!user) {
      alert("Please log in to enroll in courses.");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use your publishable key here
      amount: course.price * 100, // Amount in paise
      currency: "INR",
      name: course.title,
      description: "Purchase course",
      image: course.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Thumbnail',
      handler: async function (response) {
        try {
          // Save the enrollment status in Firestore
          await setDoc(doc(db, "enrollments", `${user.uid}_${course.id}`), {
            userId: user.uid,
            courseId: course.id,
            status: 'paid',
            paymentId: response.razorpay_payment_id,
            createdAt: new Date()
          });
          // Update the local state to enable "View Details"
          setEnrollments(prev => [...prev, { userId: user.uid, courseId: course.id, status: 'paid' }]);
          alert("Payment successful! You can now view course details.");
        } catch (error) {
          console.error("Error saving enrollment:", error);
          alert("Payment succeeded but there was an error saving your enrollment.");
        }
      },
      prefill: {
        // Optionally prefill with user's information
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

  if (loading) return <Loader />;
  if (!courses.length)
    return (
      <div className="text-center mt-12 text-xl font-semibold">
        No courses available.
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center my-8">Courses</h1>
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
                  {/* Enroll button: if already enrolled, disable it */}
                  <button
                    onClick={() => handlePayment(course)}
                    className={`inline-block text-white px-4 py-2 rounded transition ${
                      isEnrolled(course.id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={isEnrolled(course.id)}
                  >
                    {isEnrolled(course.id) ? "Enrolled" : "Enroll"}
                  </button>
                  {/* View Details button: disabled until enrolled */}
                  <button
                    onClick={() => navigate(`/coursedetails/${course.id}`)}
                    className={`inline-block text-white px-4 py-2 rounded transition ${
                      !isEnrolled(course.id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    disabled={!isEnrolled(course.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
};

export default CoursePage;
