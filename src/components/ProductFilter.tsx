import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  genders: string[];
  availability: string[];
  rating: number | null;
  bestsellers: boolean;
}

interface AvailableFilters {
  categories: string[];
  brands: string[];
  genders: string[];
  minPrice: number;
  maxPrice: number;
}

interface ProductFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableFilters: AvailableFilters;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ filters, onFilterChange, availableFilters }) => {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange);

  // Sync local state when filters prop changes
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    
    onFilterChange({
      ...filters,
      brands: newBrands
    });
  };

  const handleGenderToggle = (gender: string) => {
    const newGenders = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender];
    
    onFilterChange({
      ...filters,
      genders: newGenders
    });
  };

  const handleAvailabilityToggle = (availability: string) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];
    
    onFilterChange({
      ...filters,
      availability: newAvailability
    });
  };

  const handleRatingToggle = (rating: number) => {
    const newRating = filters.rating === rating ? null : rating;
    
    onFilterChange({
      ...filters,
      rating: newRating
    });
  };

  const handleBestsellersToggle = () => {
    onFilterChange({
      ...filters,
      bestsellers: !filters.bestsellers
    });
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newPriceRange = [...filters.priceRange] as [number, number];
    newPriceRange[index] = value;
    
    // Ensure min <= max
    if (index === 0 && value > filters.priceRange[1]) {
      newPriceRange[1] = value;
    } else if (index === 1 && value < filters.priceRange[0]) {
      newPriceRange[0] = value;
    }
    
    // Update local state for immediate UI feedback
    setLocalPriceRange(newPriceRange);
    
    // Apply filter immediately
    onFilterChange({
      ...filters,
      priceRange: newPriceRange
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      priceRange: [availableFilters.minPrice, availableFilters.maxPrice],
      categories: [],
      brands: [],
      genders: [],
      availability: [],
      rating: null,
      bestsellers: false,
    });
  };

  // Calculate if any filters are active
  const isAnyFilterActive = () => {
    return (
      filters.priceRange[0] > availableFilters.minPrice ||
      filters.priceRange[1] < availableFilters.maxPrice ||
      filters.categories.length > 0 ||
      filters.brands.length > 0 ||
      filters.genders.length > 0 ||
      filters.availability.length > 0 ||
      filters.rating !== null ||
      filters.bestsellers
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter size={20} />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {isAnyFilterActive() && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Price Range</h4>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <input
                type="range"
                min={availableFilters.minPrice}
                max={availableFilters.maxPrice}
                value={localPriceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-4">
              <input
                type="range"
                min={availableFilters.minPrice}
                max={availableFilters.maxPrice}
                value={localPriceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Select price range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </div>
        </div>
      </div>

      {/* Categories */}
      {availableFilters.categories.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium mb-4">Category</h4>
          <div className="space-y-2">
            {availableFilters.categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {availableFilters.brands.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium mb-4">Brands</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {availableFilters.brands.map((brand) => (
              <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Genders */}
      {availableFilters.genders.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium mb-4">Gender</h4>
          <div className="space-y-2">
            {availableFilters.genders.map((gender) => (
              <label key={gender} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.genders.includes(gender)}
                  onChange={() => handleGenderToggle(gender)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700 capitalize">{gender}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.availability.includes('in-stock')}
              onChange={() => handleAvailabilityToggle('in-stock')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">In Stock</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.availability.includes('out-of-stock')}
              onChange={() => handleAvailabilityToggle('out-of-stock')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Out of Stock</span>
          </label>
        </div>
      </div>

      {/* Bestsellers */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Special</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.bestsellers}
              onChange={handleBestsellersToggle}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Best Sellers</span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingToggle(rating)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </div>
                ))}
                <span className="ml-2 text-gray-700">& above</span>
              </div>
            </label>
          ))}
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === null}
              onChange={() => onFilterChange({...filters, rating: null})}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-700">Any Rating</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;