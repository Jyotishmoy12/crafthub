import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  // State to hold multiple videos
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesList);
    } catch (error) {
      toast.error('Error fetching courses: ' + error.message);
    }
  };

  // Helper to extract the YouTube video ID from a URL
  const extractYoutubeId = (url) => {
    if (typeof url !== 'string' || !url.trim()) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Add a new video input field
  const handleAddVideo = () => {
    setVideos([...videos, { youtubeUrl: '', thumbnailUrl: '' }]);
  };

  // Update the video URL for a specific video input
  const handleVideoUrlChange = (index, value) => {
    const newVideos = [...videos];
    newVideos[index].youtubeUrl = value;
    const videoId = extractYoutubeId(value);
    newVideos[index].thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : '';
    setVideos(newVideos);
  };

  // Remove a video input field
  const handleRemoveVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    setVideos(newVideos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure at least one video has been added
    if (videos.length === 0) {
      toast.error('Please add at least one video.');
      return;
    }
    // Validate each video URL
    for (let video of videos) {
      const videoId = extractYoutubeId(video.youtubeUrl);
      if (!videoId) {
        toast.error('One or more video URLs are invalid.');
        return;
      }
    }

    if (editingCourse) {
      // Update the existing course
      try {
        const courseRef = doc(db, 'courses', editingCourse.id);
        await updateDoc(courseRef, {
          title,
          description,
          price,
          videos,
        });
        toast.success('Course updated successfully!');
        resetForm();
        fetchCourses();
      } catch (error) {
        toast.error('Error updating course: ' + error.message);
      }
    } else {
      // Add a new course
      try {
        await addDoc(collection(db, 'courses'), {
          title,
          description,
          price,
          videos,
          createdAt: new Date(),
        });
        toast.success('Course added successfully!');
        resetForm();
        fetchCourses();
      } catch (error) {
        toast.error('Error adding course: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setVideos([]);
    setEditingCourse(null);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price);
    setVideos(course.videos || []);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      toast.error('Error deleting course: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster />
      <h2 className="text-3xl font-bold mb-6 text-center">
        {editingCourse ? 'Edit Course' : 'Add New Course'}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-10"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-bold mb-2">
            Course Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline transition duration-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-bold mb-2">
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline transition duration-300"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-bold mb-2">
            Course Videos:
          </label>
          {videos.map((video, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={video.youtubeUrl}
                onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline transition duration-300"
              />
              <button
                type="button"
                onClick={() => handleRemoveVideo(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddVideo}
            className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-1" /> Add Video
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-bold mb-2">
            Price (₹):
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline transition duration-300"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center cursor-pointer justify-center cursor-pointer bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          {editingCourse ? (
            <>
              <FaEdit className="mr-2" /> Update Course
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> Add Course
            </>
          )}
        </button>
      </form>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h3 className="text-2xl font-bold mb-6">Courses List</h3>
        {courses.length === 0 ? (
          <p className="text-gray-600 text-center">No courses available.</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li
                key={course.id}
                className="border-b border-gray-200 py-4 flex items-center justify-between transition duration-300 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      course.thumbnailUrl ||
                      (course.videos && course.videos[0]?.thumbnailUrl)
                    }
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded shadow"
                  />
                  <div>
                    <h4 className="text-xl font-semibold">{course.title}</h4>
                    <p className="text-gray-600">{course.description}</p>
                    <p className="text-gray-800 font-bold">
                      Price: ₹{course.price}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEdit(course)}
                    className="text-blue-500 hover:text-blue-700 transition duration-300"
                  >
                    <FaEdit size={24} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="text-red-500 hover:text-red-700 transition duration-300"
                  >
                    <FaTrash size={24} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
