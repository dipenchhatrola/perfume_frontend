import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Truck, 
  Shield, 
  RefreshCw, 
  Heart, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Package,
  Clock
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import RatingStars from '../components/RatingStars';
import { useCart } from '../context/CartContext';
import { perfumeService } from '../services/perfumeService';
import { Perfume } from '../types/perfume';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Perfume | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Perfume[]>([]);
  
  const { addToCart } = useCart();

  useEffect(() => {
    if (product) {
      // Ensure images array is properly initialized
      product.images = product.images?.length
        ? product.images
        : [product.imageUrl, ...(product.additionalImages || [])];
      
      // Ensure fragranceNotes has default structure
      if (!product.fragranceNotes) {
        product.fragranceNotes = {
          top: [],
          middle: [],
          base: []
        };
      }
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      if (!id) {
        throw new Error('Product ID is required');
      }
      
      const data = await perfumeService.getProductById(id);
      setProduct(data);
      setSelectedSize(data.size || '');
      
      // Fetch related products
      const related = await perfumeService.getRelatedProducts(data.id, data.category);
      setRelatedProducts(related);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      ...product,
      quantity,
      size: selectedSize
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images?.length) return;
    
    if (direction === 'prev') {
      setSelectedImage(prev => 
        prev === 0 ? product.images!.length - 1 : prev - 1
      );
    } else {
      setSelectedImage(prev => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Ensure images array exists and has at least one image
  const productImages = product.images?.length 
    ? product.images 
    : [product.imageUrl];

  // Ensure fragranceNotes exists
  const fragranceNotes = product.fragranceNotes || {
    top: [],
    middle: [],
    base: []
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb 
        items={[
          { label: 'Home', link: '/' },
          { label: 'Products', link: '/products' },
          { label: product.category, link: `/products?category=${product.category.toLowerCase()}` },
          { label: product.name, link: '#' },
        ]}
      />

      <div className="container-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] object-contain"
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Best Seller
                  </span>
                )}
                {product.discountedPrice && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex space-x-3 overflow-x-auto py-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index 
                      ? 'border-primary-600' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Category */}
            <div className="mb-4">
              <span className="text-primary-600 font-semibold">{product.brand}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{product.category}</span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center mb-6">
              <RatingStars rating={product.rating} />
              <span className="ml-2 text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.discountedPrice ? (
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    Save ${(product.price - product.discountedPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.longDescription || product.description}
              </p>
            </div>

            {/* Fragrance Notes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Fragrance Notes</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Top Notes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {fragranceNotes.top.map((note, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Middle Notes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {fragranceNotes.middle.map((note, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Base Notes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {fragranceNotes.base.map((note, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Size & Quantity */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Size & Quantity</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {['30ml', '50ml', '100ml'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg transition ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  {product.inStock ? (
                    <span className="text-green-600 flex items-center">
                      <Package size={16} className="mr-1" />
                      In Stock ({product.stockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="btn-primary flex-1 min-w-[200px]"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="bg-gray-900 hover:bg-black text-white font-medium py-3 px-8 rounded-lg transition flex-1 min-w-[200px]"
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center space-x-4 mb-8">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition">
                <Heart size={20} />
                <span>Add to Wishlist</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Truck size={24} className="text-primary-600" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw size={24} className="text-primary-600" />
                <div>
                  <p className="font-medium">30-Day Returns</p>
                  <p className="text-sm text-gray-600">Easy return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield size={24} className="text-primary-600" />
                <div>
                  <p className="font-medium">Authentic Products</p>
                  <p className="text-sm text-gray-600">100% genuine</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={24} className="text-primary-600" />
                <div>
                  <p className="font-medium">Long Lasting</p>
                  <p className="text-sm text-gray-600">8-12 hours longevity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Reviews would go here */}
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <img
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold mb-1">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">${relatedProduct.price.toFixed(2)}</span>
                    <RatingStars rating={relatedProduct.rating} size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;