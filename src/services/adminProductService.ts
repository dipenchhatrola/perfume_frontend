import axios from "axios";

const API = "https://perfume-signaturefragrance-backend.vercel.app/api/products";

export const addProduct = (data: FormData) =>
  axios.post(API, data);
export const getProducts = () => axios.get(API);
export const deleteProduct = (id: string) =>
  axios.delete(`${API}/${id}`);