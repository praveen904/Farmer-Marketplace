import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, Gavel, Clock, MapPin, RefreshCw } from 'lucide-react';
import axios from 'axios';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [minBid, setMinBid] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const [statusFilter, setStatusFilter] = useState('live');
  const location = useLocation();

  const livestockTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Cow', label: 'Cow' },
    { value: 'Horse', label: 'Horse' },
    { value: 'Buffalo', label: 'Buffalo' },
    { value: 'Sheep', label: 'Sheep' },
    { value: 'Goat', label: 'Goat' },
    { value: 'Pig', label: 'Pig' },
    { value: 'Chicken', label: 'Chicken' },
    { value: 'Duck', label: 'Duck' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'live', label: 'Live Auctions' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' },
    { value: 'all', label: 'All Auctions' }
  ];

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType !== 'all') params.append('livestockType', selectedType);
      if (minBid) params.append('minBid', minBid);
      if (maxBid) params.append('maxBid', maxBid);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`/api/auctions?${params.toString()}`);
      setAuctions(response.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [searchTerm, selectedType, minBid, maxBid, statusFilter]);

  // Refresh auctions when navigating back from create auction
  useEffect(() => {
    if (location.state?.refresh) {
      fetchAuctions();
    }
  }, [location]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setMinBid('');
    setMaxBid('');
    setStatusFilter('live');
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusBadge = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDate);
    const end = new Date(auction.endDate);
    
    if (now < start) return { text: 'Upcoming', color: 'badge-warning' };
    if (now >= start && now <= end) return { text: 'Live', color: 'badge-success' };
    return { text: 'Ended', color: 'badge-secondary' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
              <p className="text-gray-600">Bid on premium livestock from trusted farmers</p>
            </div>
            <button
              onClick={fetchAuctions}
              className="btn-secondary flex items-center space-x-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Livestock Type Filter */}
            <div>
              <select
                className="form-input"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {livestockTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bid Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min Bid $"
                className="form-input"
                value={minBid}
                onChange={(e) => setMinBid(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Bid $"
                className="form-input"
                value={maxBid}
                onChange={(e) => setMaxBid(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {auctions.length} auction{auctions.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {auctions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Gavel size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
                <Link
                  to="/create-auction"
                  className="btn-primary"
                >
                  Create First Auction
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => {
                  const statusBadge = getStatusBadge(auction);
                  return (
                    <div key={auction._id} className="card card-hover">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        <img
                          src={auction.images[0] || '/placeholder-auction.jpg'}
                          alt={auction.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`badge ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                          {auction.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {auction.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium">{auction.livestockType}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Breed:</span>
                            <span className="font-medium">{auction.breed}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current Bid:</span>
                            <span className="font-bold text-green-600">₹{auction.currentBid}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span>{auction.location?.city}, {auction.location?.state}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{formatTimeLeft(auction.endDate)}</span>
                          </div>
                        </div>

                        <Link
                          to={`/auctions/${auction._id}`}
                          className="btn-primary w-full text-center"
                        >
                          {statusBadge.text === 'Live' ? 'Place Bid' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions; 