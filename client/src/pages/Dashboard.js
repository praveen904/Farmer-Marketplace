import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, 
  Gavel, 
  TrendingUp, 
  Eye, 
  Star, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAuctions: 0,
    totalViews: 0,
    totalSales: 0,
    averageRating: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [updatingQuantity, setUpdatingQuantity] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [productsRes, auctionsRes, bidsRes, statsRes] = await Promise.all([
        axios.get('/api/users/products', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/auctions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/auctions/user/my-bids', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRecentProducts(productsRes.data.slice(0, 5));
      setRecentAuctions(auctionsRes.data.slice(0, 5));
      setRecentBids(bidsRes.data.slice(0, 5));

      // Calculate stats
      const totalViews = productsRes.data.reduce((sum, product) => sum + product.views, 0);
      const totalSales = productsRes.data.length + auctionsRes.data.length;
      const averageRating = user.rating || 0;

      setStats({
        totalProducts: productsRes.data.length,
        totalAuctions: auctionsRes.data.length,
        totalViews,
        totalSales,
        averageRating
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/auctions/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Auction deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error('Error deleting auction');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setUpdatingQuantity(prev => ({ ...prev, [productId]: true }));
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/products/${productId}/quantity`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Quantity updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.message || 'Error updating quantity');
    } finally {
      setUpdatingQuantity(prev => ({ ...prev, [productId]: false }));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Gavel className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
              <Link
                to="/create-product"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No products yet</p>
                <Link to="/create-product" className="btn-primary">
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatCurrency(product.price)}</span>
                          <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.quantity > 0 ? `${product.quantity} ${product.unit} available` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.quantity}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        onBlur={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          if (newQuantity !== product.quantity) {
                            handleUpdateQuantity(product._id, newQuantity);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const newQuantity = parseInt(e.target.value) || 0;
                            if (newQuantity !== product.quantity) {
                              handleUpdateQuantity(product._id, newQuantity);
                            }
                          }
                        }}
                        disabled={updatingQuantity[product._id]}
                      />
                      <Link
                        to={`/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                    View All Products
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Recent Auctions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Auctions</h2>
              <Link
                to="/create-auction"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Auction</span>
              </Link>
            </div>

            {recentAuctions.length === 0 ? (
              <div className="text-center py-8">
                <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No auctions yet</p>
                <Link to="/create-auction" className="btn-primary">
                  Create Your First Auction
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAuctions.map((auction) => (
                  <div key={auction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={auction.images[0] || '/placeholder-auction.jpg'}
                        alt={auction.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{auction.title}</h3>
                        <p className="text-sm text-gray-600">{formatCurrency(auction.currentBid)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/auctions/${auction._id}/edit`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteAuction(auction._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <Link to="/auctions" className="text-blue-600 hover:text-blue-700 font-medium">
                    View All Auctions
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bids */}
        {recentBids.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Bids</h2>
            <div className="space-y-4">
              {recentBids.map((auction) => {
                const myBid = auction.bids.find(bid => bid.bidder === user._id);
                return (
                  <div key={auction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={auction.images[0] || '/placeholder-auction.jpg'}
                        alt={auction.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{auction.title}</h3>
                        <p className="text-sm text-gray-600">
                          Your bid: {formatCurrency(myBid?.amount || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <Clock size={14} className="inline mr-1" />
                        {formatDate(auction.endDate)}
                      </div>
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="btn-secondary"
                      >
                        View Auction
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 