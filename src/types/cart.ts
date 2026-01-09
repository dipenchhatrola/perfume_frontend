import { ReactNode } from "react";

export interface CartItem {
  size: ReactNode;
  brand: ReactNode;
  id: string;
  name: string;
  price: number;

  // ✅ ADD THIS
  discountedPrice?: number;
  selectedSize?: string;

  quantity: number;
  imageUrl: string;
}
