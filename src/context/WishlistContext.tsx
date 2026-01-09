import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  inStock?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  loadUserWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload
      };
    case 'ADD_TO_WISHLIST': {
      const exists = state.items.some(item => item.id === action.payload.id);
      if (exists) {
        return state; // already in wishlist
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }
    case 'REMOVE_FROM_WISHLIST': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems
      };
    }
    case 'CLEAR_WISHLIST':
      return { items: [] };
    default:
      return state;
  }
};

// Helper function to get user-specific wishlist from localStorage
const getUserWishlist = (): WishlistItem[] => {
  try {
    const savedUser = localStorage.getItem('perfume_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const userWishlist = localStorage.getItem(`wishlist_${userData.email}`);
      return userWishlist ? JSON.parse(userWishlist) : [];
    }
    return [];
  } catch (error) {
    console.error('Error loading user wishlist:', error);
    return [];
  }
};

// Helper function to save user-specific wishlist to localStorage
const saveUserWishlist = (items: WishlistItem[]) => {
  try {
    const savedUser = localStorage.getItem('perfume_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify(items));
    }
  } catch (error) {
    console.error('Error saving user wishlist:', error);
  }
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load user-specific wishlist on initial mount
  useEffect(() => {
    const loadWishlist = () => {
      const userWishlist = getUserWishlist();
      if (userWishlist.length > 0) {
        dispatch({ type: 'LOAD_WISHLIST', payload: userWishlist });
      }
    };

    loadWishlist();
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (state.items.length > 0) {
      saveUserWishlist(state.items);
    }
  }, [state.items]);

  const value = useMemo(() => {
    const addToWishlist = (item: WishlistItem) => {
      const exists = state.items.some(wishlistItem => wishlistItem.id === item.id);
      if (!exists) {
        dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
        
        // Also save to user-specific localStorage
        const savedUser = localStorage.getItem('perfume_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userData.email}`) || '[]');
          const updatedWishlist = [...userWishlist, item];
          localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify(updatedWishlist));
        }
        
        toast.success(`${item.name} added to wishlist!`);
      } else {
        toast.error(`${item.name} is already in your wishlist`);
      }
    };

    const removeFromWishlist = (id: string) => {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
      
      // Also remove from user-specific localStorage
      const savedUser = localStorage.getItem('perfume_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userData.email}`) || '[]');
        const updatedWishlist = userWishlist.filter((item: WishlistItem) => item.id !== id);
        localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify(updatedWishlist));
      }
      
      toast.success('Removed from wishlist');
    };

    const clearWishlist = () => {
      dispatch({ type: 'CLEAR_WISHLIST' });
      
      // Also clear from user-specific localStorage
      const savedUser = localStorage.getItem('perfume_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify([]));
      }
      
      toast.success('Wishlist cleared');
    };

    const isInWishlist = (id: string) => {
      return state.items.some(item => item.id === id);
    };

    const loadUserWishlist = () => {
      const userWishlist = getUserWishlist();
      dispatch({ type: 'LOAD_WISHLIST', payload: userWishlist });
    };

    return {
      wishlist: state.items,
      wishlistCount: state.items.length,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      loadUserWishlist
    };
  }, [state.items]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};