import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  phone: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
  return response.data;
};

export const sendOTP = async (phoneData: {
  phone: string;
  otp?: string; // Optional, for testing
}) => {
  try {
    const response = await api.post("/otp/send", phoneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (verificationData: {
  phone: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/otp/verify", verificationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAllProducts = async () => {
  try {
    const response = await api.get("/product");
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
export const fetchProductById = async (productId: string) => {
  try {
    const response = await api.get(`/product/${productId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};