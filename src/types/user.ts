export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: Address[];
  defaultShippingAddress?: string;
  defaultBillingAddress?: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Order Placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cod' | 'upi';
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  perfumeId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  lastFour?: string;
  expiryDate?: string;
  upiId?: string;
  isDefault: boolean;
}