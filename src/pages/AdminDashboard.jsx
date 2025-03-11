import React, { useState, useEffect } from 'react'; 
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { Trash2, Edit, PlusCircle, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import AdminDashboardCourse from '../components/AdminDashboardCourse';
import AdminOrders from '../components/AdminOrders';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  // Tab navigation state: "dashboard", "courses", "orders"
  const [activeTab, setActiveTab] = useState("dashboard");

  // States for product management (Admin Dashboard tab)
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    ratings: 0,
    inStock: true
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Utility to safely parse float values
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Fetch products in real time
  useEffect(() => {
    const productsCollection = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCollection, snapshot => {
      const productList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        price: safeParseFloat(docSnap.data().price),
        originalPrice: safeParseFloat(docSnap.data().originalPrice),
        ratings: safeParseFloat(docSnap.data().ratings),
        inStock: docSnap.data().inStock ?? true
      }));
      setProducts(productList);
    });
    return () => unsubscribe();
  }, []);

  // Cleanup object URLs for image previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Upload a single image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Delete a product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Handle image selection and preview generation
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsProductLoading(true);
    if (imageFiles.length !== 3) {
      toast.error('Please upload exactly 3 images.');
      setIsProductLoading(false);
      return;
    }
    try {
      let imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadImageToCloudinary(file);
        if (url) imageUrls.push(url);
      }
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        images: imageUrls,
        price: safeParseFloat(newProduct.price),
        originalPrice: safeParseFloat(newProduct.originalPrice),
        ratings: safeParseFloat(newProduct.ratings),
        inStock: newProduct.inStock
      });
      setNewProduct({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        ratings: 0,
        inStock: true
      });
      setImageFiles([]);
      setImagePreviews([]);
      toast.success('Product added successfully');
      // navigate('/');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsProductLoading(false);
    }
  };

  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsProductLoading(true);
    try {
      let imageUrls = editingProduct.images || [];
      if (imageFiles.length > 0) {
        if (imageFiles.length !== 3) {
          toast.error('Please upload exactly 3 images.');
          setIsProductLoading(false);
          return;
        }
        imageUrls = [];
        for (const file of imageFiles) {
          const url = await uploadImageToCloudinary(file);
          if (url) imageUrls.push(url);
        }
      }
      const productRef = doc(db, 'products', editingProduct.id);
      const updatedProduct = {
        ...editingProduct,
        images: imageUrls,
        price: safeParseFloat(editingProduct.price),
        originalPrice: safeParseFloat(editingProduct.originalPrice),
        ratings: safeParseFloat(editingProduct.ratings)
      };
      await updateDoc(productRef, updatedProduct);
      setEditingProduct(null);
      setImageFiles([]);
      setImagePreviews([]);
      toast.success('Product updated successfully');
      // navigate('/');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsProductLoading(false);
    }
  };

  // Toggle stock status
  const handleUpdateStock = async (productId, inStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { inStock });
      toast.success(`Product marked as ${inStock ? 'in stock' : 'out of stock'}`);
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Failed to update stock status');
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="mb-6 flex border-b my-30">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 -mb-px font-semibold text-sm border-b-2 ${
              activeTab === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600 "
            }`}
          >
            Admin Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 -mb-px font-semibold text-sm border-b-2 ${
              activeTab === "courses" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            Courses
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 -mb-px font-semibold text-sm border-b-2 ${
              activeTab === "orders" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            Order Management
          </button>
          <button 
            onClick={() => {
              auth.signOut();
              navigate('/');
            }}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div>
            {/* Add/Edit Product Form */}
            <form 
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              className="bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={(e) =>
                    editingProduct 
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) =>
                    editingProduct 
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={(e) =>
                    editingProduct 
                      ? setEditingProduct({ ...editingProduct, price: e.target.value })
                      : setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Original Price"
                  value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice}
                  onChange={(e) =>
                    editingProduct 
                      ? setEditingProduct({ ...editingProduct, originalPrice: e.target.value })
                      : setNewProduct({ ...newProduct, originalPrice: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                  step="0.01"
                />
                <div className="col-span-2 mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingProduct ? editingProduct.inStock : newProduct.inStock}
                      onChange={(e) =>
                        editingProduct 
                          ? setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                          : setNewProduct({ ...newProduct, inStock: e.target.checked })
                      }
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>In Stock</span>
                  </label>
                </div>
                {/* File input and preview */}
                <div className="col-span-2 flex flex-col">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="border p-2 rounded w-full"
                      id="imageUpload"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload exactly 3 images (the first will be the cover).
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, index) => (
                        <div key={index} className="w-24 h-24 border rounded overflow-hidden">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))
                    ) : (
                      editingProduct && editingProduct.images && editingProduct.images.length > 0 && 
                      editingProduct.images.map((img, index) => (
                        <div key={index} className="w-24 h-24 border rounded overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Existing ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  type="submit"
                  disabled={isProductLoading}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center ${
                    isProductLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProductLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">...</svg>
                      {editingProduct ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2" />
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setImageFiles([]);
                      setImagePreviews([]);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Search Bar for Products */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-80">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 rounded w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    {product.images && product.images.length > 0 && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded ${
                      product.inStock ? 'bg-green-500' : 'bg-red-500'
                    } text-white text-sm`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl font-bold text-blue-800">
                          ₹{(product.price || 0).toFixed(2)}
                        </span>
                        <span className="ml-2 line-through text-gray-500">
                          ₹{(product.originalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStock(product.id, !product.inStock)}
                          className={`px-2 py-1 rounded text-white text-sm ${
                            product.inStock ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            if (product.images) setImagePreviews(product.images);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Ratings: {(product.ratings || 0).toFixed(1)}/5
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "courses" && <AdminDashboardCourse />}

        {activeTab === "orders" && <AdminOrders />}
      </div>
    </>
  );
};

export default AdminDashboard;
