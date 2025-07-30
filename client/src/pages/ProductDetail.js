import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Calendar, 
  ShoppingCart, 
  User, 
  MessageCircle,
  ArrowLeft,
  Package,
  Clock,
  Phone
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;
  const isOwner = user && product.seller._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={product.images[activeImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                      activeImage === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(product.price)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviews.length} reviews)
                  </span>
                </div>
                {product.isOrganic && (
                  <span className="badge badge-success">Organic</span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Availability</span>
                </div>
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                ) : (
                  <span className="text-green-600 font-medium">
                    {product.quantity} {product.unit} available
                  </span>
                )}
              </div>
            </div>

            {/* Contact Seller Section */}
            {!isOwner && (
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Seller</h3>
                
                {isOutOfStock ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">This product is currently out of stock.</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="btn-secondary"
                    >
                      Browse Other Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Phone size={20} className="text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Contact the Farmer</p>
                          <p className="text-sm text-green-700">
                            Call or message the farmer directly to place your order
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Farmer's Phone:</span>
                        <a 
                          href={`tel:${product.seller.phone}`}
                          className="text-green-600 font-semibold hover:text-green-700 flex items-center space-x-2"
                        >
                          <Phone size={16} />
                          <span>{product.seller.phone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="font-medium text-blue-900 mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Call the farmer directly using the phone number above</li>
                        <li>Discuss quantity, delivery, and payment details</li>
                        <li>Arrange pickup or delivery as per your convenience</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-3 mb-3">
                <User size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">Seller Information</span>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{product.seller.name}</p>
                {product.seller.farmName && (
                  <p className="text-gray-600">{product.seller.farmName}</p>
                )}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span>{product.seller.rating?.toFixed(1) || 'No rating'} ({product.seller.totalSales || 0} sales)</span>
                </div>
                {product.location && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin size={14} />
                    <span>{product.location.city}, {product.location.state}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-3">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="text-gray-900">{product.unit}</span>
                </div>
                {product.harvestDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harvest Date:</span>
                    <span className="text-gray-900">{formatDate(product.harvestDate)}</span>
                  </div>
                )}
                {product.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="text-gray-900">{formatDate(product.expiryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="text-gray-900">{product.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((review, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{formatDate(review.createdAt)}</span>
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