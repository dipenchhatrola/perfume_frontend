import axios from 'axios';
import { User } from '../types/user';

const API_BASE_URL = 'https://perfume-signaturefragrance-backend.vercel.app/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    // Mock response for now - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        resolve({
          user: mockUser,
          token: 'mock-jwt-token',
        });
      }, 1000);
    });
  },

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Mock response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: 'user',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        resolve({
          user: mockUser,
          token: 'mock-jwt-token',
        });
      }, 1000);
    });
  },

  // Update user profile
  async updateProfile(token: string, userData: Partial<User>): Promise<User> {
    // Mock response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: userData.email || 'john@example.com',
          firstName: userData.firstName || 'John',
          lastName: userData.lastName || 'Doe',
          role: 'user',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        resolve(mockUser);
      }, 1000);
    });
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Password reset email sent to ${email}`);
        resolve();
      }, 1000);
    });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Password reset successfully');
        resolve();
      }, 1000);
    });
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Email verified successfully');
        resolve();
      }, 1000);
    });
  },

  // Logout (client-side only for now)
  logout(): void {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if token is valid
  async validateToken(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },
};

export default authService;