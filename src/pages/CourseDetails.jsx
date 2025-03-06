import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// Loader component for course details
const Loader = () => (
  <div className="flex flex-col items-center justify-center mt-12">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500"></div>
    <p className="mt-4 text-xl font-semibold text-blue-500">Loading course details...</p>
  </div>
);

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Disable right-click and attempt to prevent screen recording
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Detect PrintScreen key press
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Screen recording is disabled.');
        // Optionally clear the clipboard if allowed
        navigator.clipboard.writeText('');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch course data from Firestore
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(courseRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          // Set default video if available
          if (data.videos && data.videos.length > 0) {
            setSelectedVideo(data.videos[0]);
          }
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Helper to extract the YouTube video ID from a URL
  const extractYoutubeId = (url) => {
    if (typeof url !== 'string' || !url.trim()) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) return <Loader />;
  if (!course)
    return (
      <div className="text-center mt-12 text-xl font-semibold">
        Course not found
      </div>
    );

  const videoId = selectedVideo ? extractYoutubeId(selectedVideo.youtubeUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1`
    : '';

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 select-none">
        <h1 className="text-4xl font-bold mb-4 text-center my-30">{course.title}</h1>
        <p className="mb-6 text-center text-gray-700">{course.description}</p>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video Player */}
          <div className="flex-1">
            {selectedVideo ? (
              <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow"
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onContextMenu={(e) => e.preventDefault()}
                ></iframe>
              </div>
            ) : (
              <p className="text-center text-xl font-semibold">No video selected.</p>
            )}
          </div>

          {/* Video Thumbnails List */}
          <div className="w-full md:w-60">
            <h2 className="text-2xl font-semibold mb-4">Videos</h2>
            {course.videos && course.videos.length > 0 ? (
              <ul className="space-y-4">
                {course.videos.map((video, index) => (
                  <li
                    key={index}
                    className={`border p-2 rounded cursor-pointer transition-colors ${
                      selectedVideo === video ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedVideo(video)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(video.youtubeUrl)}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-28 object-cover rounded"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <p className="mt-1 text-sm font-medium">{video.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No videos available for this course.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;
