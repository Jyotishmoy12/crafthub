import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // Added onSnapshot import
import { signOut } from 'firebase/auth'; // Imported signOut for logging out
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Maximize } from 'lucide-react';

const Loader = () => (
  <div className="flex flex-col items-center justify-center mt-12">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500"></div>
    <p className="mt-4 text-xl font-semibold text-blue-500">
      Loading course details...
    </p>
  </div>
);

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Ref for the video container only (not the whole page)
  const videoContainerRef = useRef(null);

  // Get authenticated user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // *** NEW: Session token check effect ***
  // This effect listens for changes in the user's Firestore doc and compares the activeSessionToken
  // with the token saved in localStorage. If they don't match, the user is logged out.
  useEffect(() => {
    if (!user) return;
    const sessionUnsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      const data = docSnap.data();
      const localToken = localStorage.getItem("sessionToken");
      if (data && data.activeSessionToken && data.activeSessionToken !== localToken) {
        signOut(auth);
        alert("You have been logged out because your account was signed in on another device.");
      }
    });
    return () => sessionUnsubscribe();
  }, [user]);
  // *** End of session token check effect ***

  // Prevent right-click and PrintScreen key
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Screen recording is disabled.');
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

  // Disable copy function within the video container
  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection();
      if (
        videoContainerRef.current &&
        selection.anchorNode &&
        videoContainerRef.current.contains(selection.anchorNode)
      ) {
        e.preventDefault();
        alert('Copy function is disabled on this video.');
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
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
          if (data.videos && data.videos.length > 0) {
            setSelectedVideo(data.videos[0]);
          }
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Helper to extract YouTube video ID
  const extractYoutubeId = (url) => {
    if (typeof url !== 'string' || !url.trim()) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Toggle fullscreen for the video container only
  const handleFullScreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen();
      }
    }
  };

  if (loading) return <Loader />;
  if (!course)
    return (
      <div className="text-center mt-12 text-xl font-semibold">
        Course not found
      </div>
    );

  // Disable YouTube native fullscreen and branding with fs=0 and modestbranding=1
  const videoId = selectedVideo ? extractYoutubeId(selectedVideo.youtubeUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&fs=0`
    : '';

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 select-none">
        <h1 className="text-4xl font-bold mb-4 text-center my-30">
          {course.title}
        </h1>
        <p className="mb-6 text-center text-gray-700">
          {course.description}
        </p>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video Player Container (only this container goes fullscreen) */}
          <div className="w-full md:flex-1">
            <div
              ref={videoContainerRef}
              className="relative video-container"
              style={{ aspectRatio: '16/9', width: '100%' }}
            >
              {selectedVideo ? (
                <>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow"
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-fullscreen"
                    onContextMenu={(e) => e.preventDefault()}
                  ></iframe>
                  {user && (
                    <span className="watermark">{user.email}</span>
                  )}
                  {/* Overlay for mobile screens to block share icon */}
                  <div
                    className="mobile-share-overlay"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                  {/* Overlay for desktop screens to block copy link */}
                  <div
                    className="desktop-copy-overlay"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </>
              ) : (
                <p className="text-center text-xl font-semibold">
                  No video selected.
                </p>
              )}
            </div>
            {/* Custom Fullscreen Button for Video */}
            <div className="text-right mt-4">
              <button
                onClick={handleFullScreen}
                className="flex items-center px-10 py-2 text-neutral rounded transition cursor-pointer"
              >
                <Maximize className="mr-2" /> Fullscreen
              </button>
            </div>
          </div>
          {/* Video Thumbnails */}
          <div className="w-full md:w-60">
            <h2 className="text-2xl font-semibold mb-4">Videos</h2>
            {course.videos && course.videos.length > 0 ? (
              <ul className="space-y-4">
                {course.videos.map((video, index) => (
                  <li
                    key={index}
                    className={`border p-2 rounded cursor-pointer transition-colors ${
                      selectedVideo === video
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
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
                    <p className="mt-1 text-sm font-medium">
                      {video.title}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">
                No videos available for this course.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* CSS for animated watermark, fullscreen adjustments, and overlays */}
      <style>{`
        .video-container:fullscreen {
          padding: 0;
          margin: 0;
        }
        .watermark {
          position: absolute;
          z-index: 10;
          color: #fff;
          font-size: 12px;
          padding: 5px 8px;
          border-radius: 3px;
          pointer-events: none;
          animation: watermarkMove 40s infinite alternate;
        }
        @keyframes watermarkMove {
          0% { top: 5%; left: 5%; }
          25% { top: 5%; left: 85%; }
          50% { top: 85%; left: 85%; }
          75% { top: 85%; left: 5%; }
          100% { top: 5%; left: 5%; }
        }
        /* Mobile overlay to block share icon */
        @media (max-width: 768px) {
          .mobile-share-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            pointer-events: all;
            background: transparent;
            z-index: 9999;
          }
          .desktop-copy-overlay {
            display: none;
          }
        }
        /* Desktop overlay to block copy link */
        @media (min-width: 769px) {
          .desktop-copy-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            pointer-events: all;
            background: transparent;
            z-index: 9999;
          }
          .mobile-share-overlay {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default CourseDetails;
