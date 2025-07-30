import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Gavel } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateAuction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    livestockType: 'Cow',
    breed: '',
    age: '',
    weight: '',
    healthStatus: 'Good',
    startingBid: '',
    minBidIncrement: '100',
    startDate: '',
    endDate: '',
    location: {
      city: '',
      state: ''
    }
  });

  const livestockTypes = [
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

  const healthStatuses = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Auction title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Auction description is required');
      return false;
    }
    if (!formData.breed.trim()) {
      toast.error('Breed is required');
      return false;
    }
    if (!formData.age || formData.age <= 0) {
      toast.error('Valid age is required');
      return false;
    }
    if (!formData.weight || formData.weight <= 0) {
      toast.error('Valid weight is required');
      return false;
    }
    if (!formData.startingBid || formData.startingBid <= 0) {
      toast.error('Valid starting bid is required');
      return false;
    }
    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      toast.error('End date is required');
      return false;
    }
    if (!formData.location.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.location.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (images.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();
    
    if (startDate <= now) {
      toast.error('Start date must be in the future');
      return false;
    }
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create an auction');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      const response = await axios.post('/api/auctions', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Auction created successfully!');
      navigate(`/auctions/${response.data.auction._id}`);
      
    } catch (error) {
      console.error('Create auction error:', error);
      toast.error(error.response?.data?.message || 'Error creating auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Gavel size={24} className="text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Auction</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Auction Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter auction title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Livestock Type *</label>
                <select
                  name="livestockType"
                  className="form-input"
                  value={formData.livestockType}
                  onChange={handleChange}
                  required
                >
                  {livestockTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                rows={4}
                className="form-input"
                placeholder="Describe the livestock in detail..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Livestock Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Breed *</label>
                <input
                  type="text"
                  name="breed"
                  className="form-input"
                  placeholder="Enter breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Age (years) *</label>
                <input
                  type="number"
                  name="age"
                  min="0"
                  step="0.1"
                  className="form-input"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  min="0"
                  step="0.1"
                  className="form-input"
                  placeholder="Enter weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Health Status</label>
                <select
                  name="healthStatus"
                  className="form-input"
                  value={formData.healthStatus}
                  onChange={handleChange}
                >
                  {healthStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Minimum Bid Increment (₹)</label>
                <input
                  type="number"
                  name="minBidIncrement"
                  min="10"
                  className="form-input"
                  placeholder="Enter minimum bid increment"
                  value={formData.minBidIncrement}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Auction Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Starting Bid (₹) *</label>
                <input
                  type="number"
                  name="startingBid"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="Enter starting bid"
                  value={formData.startingBid}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="location.city"
                  className="form-input"
                  placeholder="Enter city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="location.state"
                  className="form-input"
                  placeholder="Enter state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Images */}
            <div>
              <label className="form-label">Images * (Max 5)</label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload size={16} />
                  <span>Upload Images</span>
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/auctions')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <Gavel size={20} />
                <span>{loading ? 'Creating...' : 'Create Auction'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction; 