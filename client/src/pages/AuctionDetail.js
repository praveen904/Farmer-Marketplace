import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Calendar, 
  User, 
  ArrowLeft,
  Clock,
  Gavel,
  Phone,
  Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bidding, setBidding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchAuction();
    // Set up interval to refresh auction data every 30 seconds for live updates
    const interval = setInterval(fetchAuction, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuction = async () => {
    try {
      const response = await axios.get(`/api/auctions/${id}`);
      setAuction(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Error loading auction details');
      setLoading(false);
    }
  };

  const handleBid = async () => {
    if (!user) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    try {
      setBidding(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/auctions/${id}/bid`,
        { 
          amount: parseFloat(bidAmount),
          mobileNumber: mobileNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Bid placed successfully!');
      setBidAmount('');
      setMobileNumber('');
      fetchAuction(); // Refresh auction data
    } catch (error) {
      console.error('Bidding error:', error);
      toast.error(error.response?.data?.message || 'Error placing bid');
    } finally {
      setBidding(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!auction) return '';
    const now = new Date();
    const end = new Date(auction.endDate);
    const diff = end - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const isAuctionLive = () => {
    if (!auction) return false;
    const now = new Date();
    return now >= new Date(auction.startDate) && now <= new Date(auction.endDate);
  };

  const isOwner = user && auction?.seller._id === user._id;
  const currentHighestBid = auction?.bids.length > 0 
    ? auction.bids.reduce((highest, bid) => bid.amount > highest.amount ? bid : highest)
    : null;
  const minBid = currentHighestBid 
    ? currentHighestBid.amount + auction.minBidIncrement 
    : auction?.startingBid || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">The auction you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/auctions')}
            className="btn-primary"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/auctions')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Auctions</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auction Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={auction.images[activeImage] || '/placeholder-auction.jpg'}
                alt={auction.title}
                className="w-full h-96 object-cover"
              />
            </div>
            {auction.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {auction.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                      activeImage === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${auction.title} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auction Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(auction.currentBid)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {auction.views} views
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isAuctionLive() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuctionLive() ? 'LIVE' : 'ENDED'}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed">{auction.description}</p>
            </div>

            {/* Auction Status */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Auction Status</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isAuctionLive() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuctionLive() ? 'LIVE' : 'ENDED'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="text-gray-900">{formatDate(auction.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="text-gray-900">{formatDate(auction.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className={`font-medium ${isAuctionLive() ? 'text-green-600' : 'text-red-600'}`}>
                    {getTimeRemaining()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bidding Section */}
            {!isOwner && (
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Your Bid</h3>
                
                {!isAuctionLive() ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">This auction has ended.</p>
                    {auction.winner && (
                      <p className="text-green-600 font-medium">
                        Winner: {auction.winner.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Gavel size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Current Highest Bid</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(auction.currentBid)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Bid Amount (₹)
                        </label>
                        <input
                          type="number"
                          min={minBid}
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="form-input w-full"
                          placeholder={`Minimum bid: ${formatCurrency(minBid)}`}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Minimum bid: {formatCurrency(minBid)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="form-input w-full"
                          placeholder="Enter your mobile number"
                          maxLength="10"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Required for auction owner contact
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleBid}
                      disabled={bidding || !user || !bidAmount || parseFloat(bidAmount) < minBid || !mobileNumber}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      <Gavel size={20} />
                      <span>{bidding ? 'Placing Bid...' : 'Place Bid'}</span>
                    </button>

                    {!user && (
                      <p className="text-sm text-gray-600 text-center">
                        Please <button onClick={() => navigate('/login')} className="text-green-600 hover:underline">login</button> to place a bid
                      </p>
                    )}
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
                <p className="text-gray-900 font-medium">{auction.seller.name}</p>
                {auction.seller.farmName && (
                  <p className="text-gray-600">{auction.seller.farmName}</p>
                )}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span>{auction.seller.rating?.toFixed(1) || 'No rating'}</span>
                </div>
                {auction.location && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin size={14} />
                    <span>{auction.location.city}, {auction.location.state}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Phone size={14} />
                  <span>{auction.seller.phone}</span>
                </div>
              </div>
            </div>

            {/* Livestock Details */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-3">Livestock Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900">{auction.livestockType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Breed:</span>
                  <span className="text-gray-900">{auction.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="text-gray-900">{auction.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="text-gray-900">{auction.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Status:</span>
                  <span className="text-gray-900">{auction.healthStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Starting Bid:</span>
                  <span className="text-gray-900">{formatCurrency(auction.startingBid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Bid Increment:</span>
                  <span className="text-gray-900">{formatCurrency(auction.minBidIncrement)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bids History */}
        {auction.bids.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid History</h2>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Bidder
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Amount
                       </th>
                       {isOwner && (
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Mobile
                         </th>
                       )}
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Date
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auction.bids
                      .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
                      .map((bid, index) => (
                                                 <tr key={index} className={index === 0 ? 'bg-green-50' : ''}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                             {bid.bidder.name}
                             {index === 0 && (
                               <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                 Highest
                               </span>
                             )}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                             {formatCurrency(bid.amount)}
                           </td>
                           {isOwner && (
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                               <a href={`tel:${bid.mobileNumber}`} className="text-green-600 hover:text-green-700">
                                 {bid.mobileNumber}
                               </a>
                             </td>
                           )}
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {formatDate(bid.bidTime)}
                           </td>
                         </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail; 