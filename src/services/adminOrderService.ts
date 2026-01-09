import axios from "axios";

const API = "https://perfume-signaturefragrance-backend.vercel.app/api/orders";

export const getOrders = () => axios.get(API);
export const acceptOrder = (id: string) =>
  axios.put(`${API}/${id}/accept`);
export const rejectOrder = (id: string) =>
  axios.put(`${API}/${id}/reject`);