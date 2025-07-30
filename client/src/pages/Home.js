import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Gavel, 
  Users, 
  Star, 
  ArrowRight,
  Truck,
  Shield,
  Clock
} from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeFarmers: 0,
    productsListed: 0,
    liveAuctions: 0,
    happyCustomers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, auctionsRes, statsRes] = await Promise.all([
          axios.get('/api/products?limit=6'),
          axios.get('/api/auctions?status=live&limit=3'),
          axios.get('/api/stats')
        ]);
        
        setFeaturedProducts(productsRes.data);
        setLiveAuctions(auctionsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default stats if API fails
        setStats({
          activeFarmers: 0,
          productsListed: 0,
          liveAuctions: 0,
          happyCustomers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: ShoppingBag,
      title: 'Fresh Products',
      description: 'Buy directly from local farmers. Fresh, organic, and quality assured products.'
    },
    {
      icon: Gavel,
      title: 'Live Auctions',
      description: 'Bid on livestock and premium products in real-time auctions.'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Connect with verified farmers and build lasting relationships.'
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'Every product is reviewed and rated by our community.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh from the
              <span className="text-green-600"> Farm</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect directly with local farmers. Buy fresh produce, livestock, and farm products 
              through our trusted marketplace and live auctions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Browse Products</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/auctions"
                className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <Gavel size={20} />
                <span>View Auctions</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Farmer's Market?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a platform that connects farmers directly with consumers, 
              ensuring fresh, quality products at fair prices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.activeFarmers}+
              </div>
              <div className="text-green-100">
                Active Farmers
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.productsListed}+
              </div>
              <div className="text-green-100">
                Products Listed
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.liveAuctions}+
              </div>
              <div className="text-green-100">
                Live Auctions
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.happyCustomers}+
              </div>
              <div className="text-green-100">
                Happy Customers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <div key={product._id} className="card card-hover">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <span className="text-green-600 font-bold">
                        ₹{product.price}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        by {product.seller?.name}
                      </span>
                      <Link
                        to={`/products/${product._id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Live Auctions
            </h2>
            <Link
              to="/auctions"
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveAuctions.slice(0, 3).map((auction) => (
                <div key={auction._id} className="card card-hover">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={auction.images[0] || '/placeholder-auction.jpg'}
                      alt={auction.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {auction.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {auction.description}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500">
                        Current Bid: ₹{auction.currentBid}
                      </span>
                      <span className="badge badge-success">
                        Live
                      </span>
                    </div>
                    <Link
                      to={`/auctions/${auction._id}`}
                      className="btn-primary w-full text-center"
                    >
                      Place Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already selling their products and livestock 
            through our trusted marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Register as Farmer
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 