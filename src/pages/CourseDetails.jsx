import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Maximize, Lock, Play, Menu, X, Home, BookOpen, List, ChevronLeft, ChevronRight } from 'lucide-react';

const Loader = () => (
  <div className="flex flex-col items-center justify-center mt-12">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
    <p className="mt-4 text-lg font-semibold text-indigo-600">
      Loading course details...
    </p>
  </div>
);

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const videoContainerRef = useRef(null);
  const playlistRef = useRef(null);

  // Get authenticated user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Check device orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    window.addEventListener('resize', checkOrientation);
    checkOrientation(); // Check on mount
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Check session token function: runs only when this page is active.
  const checkSessionToken = async () => {
    if (!user) return;
    const localToken = localStorage.getItem("sessionToken");
    const docSnap = await getDoc(doc(db, "users", user.uid));
    const data = docSnap.data();
    if (data && data.activeSessionToken && data.activeSessionToken !== localToken) {
      // If the page is in focus, sign out
      if (document.visibilityState === "visible") {
        await signOut(auth);
        alert("You have been logged out because your account was signed in on another device.");
        navigate("/");
      }
    }
  };

  // Run check on mount and when window gains focus
  useEffect(() => {
    // Check immediately when component mounts
    checkSessionToken();
    // Attach focus event handler
    window.addEventListener("focus", checkSessionToken);
    return () => window.removeEventListener("focus", checkSessionToken);
  }, [user, navigate]);

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

  // Close playlist when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playlistRef.current && !playlistRef.current.contains(event.target) && window.innerWidth < 768) {
        setShowPlaylist(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    return () => document.removeEventListener('copy', handleCopy);
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
            setSelectedVideoIndex(0);
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

  // Toggle mobile playlist
  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
    if (!showPlaylist) {
      setActiveTab('lessons');
    }
  };

  // Select video and close mobile playlist
  const handleSelectVideo = (video, index) => {
    setSelectedVideo(video);
    setSelectedVideoIndex(index);
    setActiveTab('video');
    setShowPlaylist(false);
  };

  // Navigate to previous/next video
  const goToNextVideo = () => {
    if (course?.videos && selectedVideoIndex < course.videos.length - 1) {
      const nextIndex = selectedVideoIndex + 1;
      setSelectedVideo(course.videos[nextIndex]);
      setSelectedVideoIndex(nextIndex);
    }
  };

  const goToPrevVideo = () => {
    if (course?.videos && selectedVideoIndex > 0) {
      const prevIndex = selectedVideoIndex - 1;
      setSelectedVideo(course.videos[prevIndex]);
      setSelectedVideoIndex(prevIndex);
    }
  };

  // Calculate lesson progress
  const progressPercentage = course?.videos 
    ? ((selectedVideoIndex + 1) / course.videos.length) * 100 
    : 0;

  if (loading) return <Loader />;
  if (!course)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="text-red-500 text-5xl mb-4">
          <Lock size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Go Back Home
        </button>
      </div>
    );

  const videoId = selectedVideo ? extractYoutubeId(selectedVideo.youtubeUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&fs=0`
    : '';

  const hasPrevVideo = selectedVideoIndex > 0;
  const hasNextVideo = course?.videos && selectedVideoIndex < course.videos.length - 1;

  return (
    <>
      {/* Hide navbar on mobile when in video view */}
      <div className={`${activeTab === 'video' && !isLandscape ? 'hidden md:block' : ''}`}>
        <Navbar />
      </div>
      
      <div className={`w-full mx-auto pb-16 md:pb-0 bg-gray-50 min-h-screen ${activeTab === 'video' && !isLandscape ? 'pt-0' : 'pt-4'}`}>
        {/* Mobile Back Button (when in video mode) */}
        {activeTab === 'video' && !isLandscape && (
          <div className="flex items-center bg-gray-100 p-3 md:hidden">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-700"
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back to courses</span>
            </button>
          </div>
        )}
        
        <div className="bg-white md:rounded-xl md:shadow-lg overflow-hidden md:mx-4 md:my-4">
          {/* Course Title - Hide on mobile when in video view */}
          <div className={`p-4 border-b border-gray-100 ${activeTab === 'video' && !isLandscape ? 'hidden md:block' : ''}`}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            <p className="text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-none">
              {course.description}
            </p>
            
            {/* Mobile Progress Bar */}
            <div className="mt-4 md:hidden">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{selectedVideoIndex + 1}/{course.videos?.length || 0} lessons</span>
                <span>{progressPercentage.toFixed(0)}% complete</span>
              </div>
            </div>
          </div>
          
          {/* Video Player Section */}
          <div className={`md:flex ${activeTab !== 'video' && !isLandscape ? 'hidden' : ''}`}>
            {/* Main Content Area */}
            <div className="md:w-full lg:w-3/4">
              {/* Video Player */}
              <div className="relative">
                <div 
                  ref={videoContainerRef}
                  className="relative video-container bg-black"
                  style={{ aspectRatio: '16/9', width: '100%' }}
                >
                  {selectedVideo ? (
                    <>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
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
                      <div
                        className="mobile-share-overlay"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                      <div
                        className="desktop-copy-overlay"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                      <p className="text-center text-xl font-semibold">
                        No video selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video Controls & Title */}
              <div className="p-4 flex flex-wrap justify-between items-center bg-gray-50 border-t border-b border-gray-100">
                <div className="mr-2 mb-2 sm:mb-0 truncate max-w-full sm:max-w-md">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                    {selectedVideo?.title || "Select a video to play"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 md:hidden">
                    Lesson {selectedVideoIndex + 1} of {course.videos?.length}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {/* Mobile Prev/Next Navigation */}
                  <div className="flex md:hidden space-x-2">
                    <button
                      onClick={goToPrevVideo}
                      disabled={!hasPrevVideo}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${hasPrevVideo ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={goToNextVideo}
                      disabled={!hasNextVideo}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${hasNextVideo ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleFullScreen}
                    className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <Maximize size={16} className="mr-1" /> Fullscreen
                  </button>
                </div>
              </div>
            </div>
            
            {/* Playlist Section - Desktop (Always visible) and Mobile (Conditional) */}
            <div 
              ref={playlistRef}
              className={`lg:w-1/4 bg-white lg:border-l border-gray-100 ${
                showPlaylist 
                  ? 'fixed inset-0 z-50 pt-16 pb-20 overflow-y-auto bg-white md:static md:inset-auto md:pt-0 md:pb-0 md:z-auto'
                  : 'hidden lg:block'
              }`}
            >
              {/* Mobile Playlist Header */}
              <div className="lg:hidden fixed top-0 left-0 right-0 bg-indigo-600 text-white p-4 z-10 flex justify-between items-center">
                <h3 className="font-bold">Course Content</h3>
                <button onClick={togglePlaylist}>
                  <X size={24} />
                </button>
              </div>
              
              {/* Playlist Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 hidden lg:block">
                  Course Content
                </h2>
                {course.videos && course.videos.length > 0 ? (
                  <div className="space-y-3 max-h-96 lg:max-h-screen overflow-y-auto pr-2 playlist-scroll">
                    {course.videos.map((video, index) => {
                      const isSelected = selectedVideoIndex === index;
                      const thumbnailId = extractYoutubeId(video.youtubeUrl);
                      
                      return (
                        <div
                          key={index}
                          className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'ring-2 ring-indigo-600 shadow-md' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleSelectVideo(video, index)}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <div className="flex md:block">
                            <div className="relative w-24 h-16 md:w-full md:h-20">
                              <img
                                src={`https://img.youtube.com/vi/${thumbnailId}/hqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                              />
                              <div className={`absolute inset-0 bg-black ${isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'} transition-opacity duration-300`}></div>
                              <div className={`absolute inset-0 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                                <div className="bg-white bg-opacity-90 rounded-full p-1.5">
                                  <Play size={18} className="text-indigo-600" />
                                </div>
                              </div>
                              <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-tl-md">
                                {index + 1}/{course.videos.length}
                              </div>
                            </div>
                            <div className={`flex-1 p-2 ${isSelected ? 'bg-indigo-50' : 'bg-white'}`}>
                              <p className="text-sm font-medium line-clamp-2">
                                {video.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Lesson {index + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      No videos available for this course.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Mobile Close Button at Bottom */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <button 
                  className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg"
                  onClick={() => {
                    setShowPlaylist(false);
                    setActiveTab('video');
                  }}
                >
                  Return to Video
                </button>
              </div>
            </div>
          </div>
          
          {/* Course Info Tab - Mobile Only */}
          <div className={`px-4 py-6 ${activeTab !== 'info' || isLandscape ? 'hidden' : ''}`}>
            <h2 className="text-xl font-bold mb-4">About This Course</h2>
            <p className="text-gray-700 mb-4">
              {course.description}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Course Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                You've completed {selectedVideoIndex} of {course.videos?.length} lessons ({progressPercentage.toFixed(0)}%)
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-2">Course Content</h3>
              <p className="text-sm text-gray-600 mb-4">
                {course.videos?.length} lessons • Self-paced learning
              </p>
              
              <button
                onClick={() => {
                  setShowPlaylist(true);
                  setActiveTab('lessons');
                }}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg mb-4"
              >
                View All Lessons
              </button>
              
              <button
                onClick={() => setActiveTab('video')}
                className="w-full py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg"
              >
                Continue Learning
              </button>
            </div>
          </div>
          
          {/* Lessons List Tab - Mobile Only */}
          <div className={`${activeTab !== 'lessons' || isLandscape || showPlaylist ? 'hidden' : ''}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Course Lessons</h2>
              <p className="text-sm text-gray-600 mt-1">
                {course.videos?.length} lessons • {progressPercentage.toFixed(0)}% complete
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {course.videos?.map((video, index) => {
                const isCompleted = index < selectedVideoIndex;
                const isCurrent = index === selectedVideoIndex;
                
                return (
                  <div 
                    key={index}
                    className={`p-4 flex items-center space-x-3 ${isCurrent ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleSelectVideo(video, index)}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Lesson {index + 1}</p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Play size={18} className={`${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Udemy-style Bottom Navigation - Mobile Only
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around">
          <button 
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'video' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('video')}
          >
            <Play size={20} />
            <span className="text-xs mt-1">Video</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'lessons' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('lessons')}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Lessons</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-2 px-4 ${activeTab === 'info' ? 'text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('info')}
          >
            <List size={20} />
            <span className="text-xs mt-1">Info</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 px-4 text-gray-500"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
        </div>
      </div> */}
      
      <Footer className="hidden md:block" />
      <style>{`
        .video-container:fullscreen {
          padding: 0;
          margin: 0;
          background: black;
        }
        
        .watermark {
          position: absolute;
          z-index: 10;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          pointer-events: none;
          animation: watermarkMove 40s infinite alternate;
          backdrop-filter: blur(2px);
        }
        
        @keyframes watermarkMove {
          0% { top: 5%; left: 5%; }
          25% { top: 5%; left: 85%; }
          50% { top: 85%; left: 85%; }
          75% { top: 85%; left: 5%; }
          100% { top: 5%; left: 5%; }
        }
        
        .playlist-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
        }
        
        .playlist-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .playlist-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .playlist-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }
        
        /* Fix for iOS Safari 100vh issue */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            height: -webkit-fill-available;
          }
        }
        
        /* Ensure content is visible below fixed headers on mobile */
        @media (max-width: 768px) {
          .pt-safe {
            padding-top: env(safe-area-inset-top, 0px);
          }
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        }
        
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
        
        /* Line clamp for truncating text */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default CourseDetails;