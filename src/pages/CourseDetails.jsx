import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
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

    // Disable YouTube native fullscreen by setting fs=0
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
                            // Using the aspect-ratio property to enforce 16:9 ratio.
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
                                        onContextMenu={(e) => e.preventDefault()}
                                    ></iframe>
                                    {user && (
                                        <span className="watermark">{user.email}</span>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-xl font-semibold">
                                    No video selected.
                                </p>
                            )}
                        </div>
                        {/* Custom Fullscreen Button for Video */}
                        <div className="text-right mt-4 ">

                            {/* <button
                onClick={handleFullScreen}
                className="px-10 py-2 text-gray rounded transition"
              >
                
                <Maximize /> Fullscreen
              </button> */}

                            <button onClick={handleFullScreen} className="flex items-center px-10 py-2 text-neutral rounded transition cursor-pointer">
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
                                        className={`border p-2 rounded cursor-pointer transition-colors ${selectedVideo === video
                                                ? 'bg-blue-100'
                                                : 'hover:bg-gray-100'
                                            }`}
                                        onClick={() => setSelectedVideo(video)}
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        <img
                                            src={`https://img.youtube.com/vi/${extractYoutubeId(
                                                video.youtubeUrl
                                            )}/hqdefault.jpg`}
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
            {/* CSS for animated watermark and fullscreen adjustments */}
            <style>{`
        /* Ensure that when the video container goes fullscreen, it uses the full container without extra padding */
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
          0% {
            top: 5%;
            left: 5%;
          }
          25% {
            top: 5%;
            left: 85%;
          }
          50% {
            top: 85%;
            left: 85%;
          }
          75% {
            top: 85%;
            left: 5%;
          }
          100% {
            top: 5%;
            left: 5%;
          }
        }
      `}</style>
        </>
    );
};

export default CourseDetails;
