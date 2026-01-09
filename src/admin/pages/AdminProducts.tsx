import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://perfume-signaturefragrance-backend.vercel.app/api';

// Define the Product type matching your API
interface Product {
  _id?: string;
  name: string;
  price: number;
  description: string;
  image: string;
  family: string;
  quantity: number;
  rating: number;
  createdAt?: string;
}

// Categories for dropdown
const categories = [
  'All Categories',
  'Woody',
  'Floral',
  'Fresh',
  'Earthwy',
  'Spicy',
  'Fruity',
  'Citrus'
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    description: '',
    image: '',
    family: 'Woody',
    quantity: 0,
    rating: 5
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit mode file state
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editSelectedFileUrl, setEditSelectedFileUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on category and search query
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => product.family === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.family.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product`);

      if (response.data.success) {
        const productsWithFullUrls = response.data.products.map((product: Product) => ({
          ...product,
          // If image is a relative path, prepend the base URL
          image: product.image.startsWith('http')
            ? product.image
            : `https://perfume-signaturefragrance-backend.vercel.app${product.image.startsWith('/') ? '' : '/'}${product.image}`
        }));

        console.log('Processed products:', productsWithFullUrls);
        setProducts(productsWithFullUrls || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'quantity' || name === 'rating'
        ? parseFloat(value) || 0
        : value
    });
  };

  // Handle file selection for Add mode
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setSelectedFileUrl(fileUrl);
    }
  };

  // Handle file selection for Edit mode
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setEditSelectedFileUrl(fileUrl);
    }
  };

  // Reset form and file states
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      image: '',
      family: 'Woody',
      quantity: 0,
      rating: 5
    });
    setSelectedFile(null);
    setSelectedFileUrl('');
    setUploadProgress(0);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset edit form and file states
  const resetEditForm = () => {
    setEditSelectedFile(null);
    setEditSelectedFileUrl('');

    // Clear file input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Open Add Product Modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open Edit Product Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image,
      family: product.family || 'Woody',
      quantity: product.quantity || 0,
      rating: product.rating || 5
    });

    // Reset edit file states
    resetEditForm();

    // Set existing image as preview
    setEditSelectedFileUrl(product.image);

    setShowEditModal(true);
  };

  // Add new product
  const handleAddProduct = async () => {
    // Validate required fields
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate file is selected
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    // Validate price (should be positive)
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    // Validate quantity (should not be negative)
    if (formData.quantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    // Validate rating (should be between 1 and 5)
    if (formData.rating < 1 || formData.rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create FormData
      const productFormData = new FormData();

      // Add text fields - EXACT FIELD NAMES AS EXPECTED BY BACKEND
      productFormData.append('name', formData.name);
      productFormData.append('price', formData.price.toString());
      productFormData.append('description', formData.description);
      productFormData.append('family', formData.family);
      productFormData.append('quantity', formData.quantity.toString());
      productFormData.append('rating', formData.rating.toString());

      // Add image file - FIELD NAME MUST BE 'image' (as in upload.single('image'))
      productFormData.append('image', selectedFile);

      console.log('Sending product data with file:', selectedFile.name);

      // Send to backend - ENDPOINT IS /api/product (singular)
      const response = await axios.post(`${API_BASE_URL}/product`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ?
            Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setUploadProgress(progress);
        }
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        // Refresh products list
        fetchProducts();
        setShowAddModal(false);
        resetForm();
        setIsUploading(false);
        alert('Product added successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (err: any) {
      setIsUploading(false);
      console.error('Full error:', err);

      // Detailed error message
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);

        // Check if it's a file validation error from multer
        if (err.response.data.message && err.response.data.message.includes('Only images are allowed')) {
          alert('Error: Only JPG, PNG, and WebP images are allowed. File must be less than 5MB.');
        } else {
          alert(`Error ${err.response.status}: ${err.response.data?.message || 'Failed to add product'}`);
        }
      } else if (err.request) {
        console.error('No response received');
        alert('Cannot connect to server. Please check if backend is running on https://perfume-signaturefragrance-backend.vercel.app');
      } else {
        console.error('Error message:', err.message);
        alert('Error: ' + err.message);
      }
    }
  };

  // Update existing product
  const handleUpdateProduct = async () => {
    if (!editingProduct?._id || !formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate price
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    // Validate quantity
    if (formData.quantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    // Validate rating
    if (formData.rating < 1 || formData.rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create FormData
      const productFormData = new FormData();

      // Add text fields
      productFormData.append('name', formData.name);
      productFormData.append('price', formData.price.toString());
      productFormData.append('description', formData.description);
      productFormData.append('family', formData.family);
      productFormData.append('quantity', formData.quantity.toString());
      productFormData.append('rating', formData.rating.toString());

      // Add image file if new file is selected
      if (editSelectedFile) {
        productFormData.append('image', editSelectedFile);
      }

      console.log('Updating product:', editingProduct._id);

      // Send to backend
      const response = await axios.put(`${API_BASE_URL}/product/${editingProduct._id}`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ?
            Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setUploadProgress(progress);
        }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        // Refresh products list
        fetchProducts();
        setShowEditModal(false);
        setEditingProduct(null);
        setIsUploading(false);
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (err: any) {
      setIsUploading(false);
      console.error('Error updating product:', err);

      if (err.response) {
        console.error('Error response:', err.response.data);
        alert(`Error ${err.response.status}: ${err.response.data?.message || 'Failed to update product'}`);
      } else if (err.request) {
        alert('Cannot connect to server. Please check if backend is running.');
      } else {
        alert('Error: ' + err.message);
      }
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/product/${id}`);
      console.log('Delete response:', response.data);

      if (response.data.success) {
        // Remove product from local state
        setProducts(products.filter(product => product._id !== id));
        alert('Product deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
  };

  // Get category counts
  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      if (cat === 'All Categories') {
        counts[cat] = products.length;
      } else {
        counts[cat] = products.filter(p => p.family === cat).length;
      }
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Handle loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-lg font-semibold text-gray-700">Loading Products...</div>
            <div className="mt-2 text-sm text-gray-500">Please wait a moment</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6"
    >
      {/* Header with Add Button */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-2"
            >
              <Sparkles className="text-blue-500" size={24} />
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring" as const }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Admin Products Dashboard
              </motion.h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-600 mt-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Manage your products inventory
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Stock</p>
                <p className="text-3xl font-bold text-gray-800">
                  {products.reduce((sum, product) => sum + (product.quantity || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{products.reduce((sum, product) => sum + (product.price * (product.quantity || 0)), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 5a1 1 0 100 2h1a2 2 0 011.732 1H7a1 1 0 100 2h2.732A2 2 0 018 11H7a1 1 0 00-.707 1.707l3 3a1 1 0 001.414-1.414l-1.483-1.484A4.008 4.008 0 0011.874 10H13a1 1 0 100-2h-1.126a3.976 3.976 0 00-.41-1H13a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-2xl p-6 border border-white/50 backdrop-blur-sm relative overflow-hidden">

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-32 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 rounded-full translate-y-24 -translate-x-16"></div>

          <div className="relative z-10">
            {/* Header with title and stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Filter Products
                  </h2>
                </div>
                <p className="text-gray-600 text-sm ml-12">Find products by category or name with advanced filtering</p>
              </div>

              {/* Results badge and clear button */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${filteredProducts.length > 0 ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      <span className="font-bold text-blue-600">{filteredProducts.length}</span> products found
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Total: {products.length}
                  </div>
                </motion.div>

                {(selectedCategory !== 'All Categories' || searchQuery) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="group relative bg-gradient-to-r from-gray-800 to-gray-700 text-white px-4 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <span className="relative z-10 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Filters
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Search and Filter Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Search Input - Modern Design */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-3 ml-1">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Products
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, description, or category..."
                      className="w-full pl-12 pr-12 py-3.5 bg-transparent focus:outline-none placeholder-gray-400 text-gray-700"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Filter - Modern Design */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-3 ml-1">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Filter by Category
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                    <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent focus:outline-none appearance-none text-gray-700 pr-12 cursor-pointer"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category} ({categoryCounts[category] || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl shadow-lg"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {searchQuery
              ? `No products found for "${searchQuery}"`
              : `No products found in "${selectedCategory}" category`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
            >
              Clear Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
            >
              Add New Product
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div>
            {/* Results Summary */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-gray-700">
                Showing <span className="font-bold text-blue-600">{filteredProducts.length}</span> of{' '}
                <span className="font-bold">{products.length}</span> products
                {selectedCategory !== 'All Categories' && (
                  <span className="ml-2">
                    in <span className="font-semibold text-purple-600">{selectedCategory}</span>
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-2">
                    for "<span className="font-semibold text-green-600">{searchQuery}</span>"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Sort by:
                  <select className="ml-2 border-none bg-transparent focus:outline-none font-medium">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Product Image with Overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image);
                        // Try multiple fallback options
                        const target = e.target as HTMLImageElement;

                        // First fallback: try base URL + relative path
                        if (!product.image.startsWith('http') && !product.image.startsWith('/uploads/')) {
                          target.src = `https://perfume-signaturefragrance-backend.vercel.app/uploads/products/${product.image}`;
                        } else if (product.image.startsWith('/uploads/')) {
                          target.src = `https://perfume-signaturefragrance-backend.vercel.app${product.image}`;
                        } else {
                          // Final fallback to Unsplash
                          target.src = 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&auto=format&fit=crop';
                        }
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', product.image);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${(product.quantity || 0) > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                        {(product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm">
                        {product.family || 'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="font-bold text-2xl bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"
                      >
                        ₹{product.price.toFixed(2)}
                      </motion.span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">Stock: {product.quantity || 0}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(product)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => product._id && handleDeleteProduct(product._id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image * (Max 5MB, JPG/PNG/WebP only)
                    </label>

                    {/* File Upload Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {selectedFile ? (
                          <div className="space-y-4">
                            {/* Image Preview */}
                            <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden">
                              <img
                                src={selectedFileUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setSelectedFileUrl('');
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Click to upload image
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, WebP up to 5MB
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                            >
                              Browse Files
                            </button>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Note: Image will be saved to /public/uploads/products/
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="family"
                      value={formData.family}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Woody">Woody</option>
                      <option value="Floral">Floral</option>
                      <option value="Fresh">Fresh</option>
                      <option value="Earthwy">Earthwy</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Fruity">Fruity</option>
                      <option value="Citrus">Citrus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    disabled={isUploading || !selectedFile}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${isUploading || !selectedFile
                      ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Uploading... ({uploadProgress}%)
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditModal && editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* File Upload Section for Edit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image (Max 5MB, JPG/PNG/WebP only)
                    </label>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditFileSelect}
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        id="edit-file-upload"
                      />
                      <label htmlFor="edit-file-upload" className="cursor-pointer">
                        {editSelectedFile ? (
                          <div className="space-y-4">
                            {/* New Image Preview */}
                            <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden">
                              <img
                                src={editSelectedFileUrl}
                                alt="New Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-800">{editSelectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(editSelectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-blue-600 mt-1">New image selected</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditSelectedFile(null);
                                setEditSelectedFileUrl('');
                                if (editFileInputRef.current) {
                                  editFileInputRef.current.value = '';
                                }
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove New Image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Current Image */}
                            <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden">
                              <img
                                src={editingProduct.image}
                                alt="Current"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400';
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Current image</p>
                              <p className="text-xs text-gray-400 mt-1">Click to upload new image</p>
                            </div>
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                            >
                              Change Image
                            </button>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Leave unchanged to keep current image
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="family"
                      value={formData.family}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Woody">Woody</option>
                      <option value="Floral">Floral</option>
                      <option value="Fresh">Fresh</option>
                      <option value="Earthwy">Earthwy</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Fruity">Fruity</option>
                      <option value="Citrus">Citrus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProduct}
                    disabled={isUploading}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${isUploading
                      ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Updating... ({uploadProgress}%)
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}