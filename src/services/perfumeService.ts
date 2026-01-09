import axios from 'axios';
import { Perfume, FilterOptions } from '../types/perfume';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://perfume-signaturefragrance-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const perfumeService = {
  // Get all products with optional filters
  async getProducts(filters?: any): Promise<Perfume[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    
    const response = await api.get(`/perfumes?${params}`);
    return response.data;
  },

  // Get single product by ID
  async getProductById(id: string): Promise<Perfume> {
    const response = await api.get(`/perfumes/${id}`);
    return response.data;
  },

  // Get related products
  async getRelatedProducts(productId: string, category: string): Promise<Perfume[]> {
    const response = await api.get(`/perfumes/related/${productId}?category=${category}`);
    return response.data;
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Perfume[]> {
    const response = await api.get('/perfumes/featured');
    return response.data;
  },

  // Get new arrivals
  async getNewArrivals(): Promise<Perfume[]> {
    const response = await api.get('/perfumes/new');
    return response.data;
  },

  // Get best sellers
  async getBestSellers(): Promise<Perfume[]> {
    const response = await api.get('/perfumes/bestsellers');
    return response.data;
  },

  // Search products
  async searchProducts(query: string): Promise<Perfume[]> {
    const response = await api.get(`/perfumes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get brands
  async getBrands(): Promise<any[]> {
    const response = await api.get('/brands');
    return response.data;
  },

  // Get categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get filter options
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get('/filters');
    return response.data;
  },

  // Create product (admin only)
  async createProduct(productData: Partial<Perfume>): Promise<Perfume> {
    const response = await api.post('/perfumes', productData);
    return response.data;
  },

  // Update product (admin only)
  async updateProduct(id: string, productData: Partial<Perfume>): Promise<Perfume> {
    const response = await api.put(`/perfumes/${id}`, productData);
    return response.data;
  },

  // Delete product (admin only)
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/perfumes/${id}`);
  },

  // Upload product image
  async uploadImage(imageFile: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default perfumeService;