/*export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountedPrice?: number;

  description: string;
  longDescription?: string;

  category: 'men' | 'women' | 'unisex';
  subCategory: string[];

  concentration: 'EDP' | 'EDT' | 'Parfum';

  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };

  size: string;

  rating: number;
  reviewsCount: number;

  // Images
  imageUrl: string;
  additionalImages?: string[];
  images?: string[];

  // Stock
  inStock: boolean;
  stockQuantity: number;

  // Badges
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}*/
export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  description: string;
  category: 'men' | 'women' | 'unisex';
  rating: number; // Changed from optional to required
  reviews?: number;
  inStock?: boolean;
  size?: string;
  notes?: string[];
  concentration?: string;
  createdAt?: string;
  discountedPrice?: number;
  longDescription?: string;
  fragranceNotes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  reviewsCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  additionalImages?: string[];
  images?: string[];
}

export interface CartItem extends Perfume {
  quantity: number;
}

export interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
}