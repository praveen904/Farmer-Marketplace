import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Grains',
    price: '',
    quantity: '',
    unit: 'kg',
    location: {
      city: '',
      state: '',
      district: ''
    },
    isOrganic: false,
    harvestDate: '',
    expiryDate: ''
  });

  const categories = [
    { value: 'Grains', label: 'Grains' },
    { value: 'Vegetables', label: 'Vegetables' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Poultry', label: 'Poultry' },
    { value: 'Processed', label: 'Processed' },
    { value: 'Organic', label: 'Organic' },
    { value: 'Other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'pound', label: 'Pound' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'piece', label: 'Piece' },
    { value: 'litre', label: 'Litre' },
    { value: 'gallon', label: 'Gallon' },
    { value: 'bag', label: 'Bag' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
        [name]: type === 'checkbox' ? checked : value
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
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Valid quantity is required');
      return false;
    }
    if (images.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    if (!formData.location.city || !formData.location.state || !formData.location.district) {
      toast.error('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
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
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Product created successfully!');
      navigate('/products', { state: { refresh: true } });
    } catch (error) {
      console.error('Error creating product:', error);
      const message = error.response?.data?.message || 'Error creating product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-600">List your fresh products for sale</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-input"
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Pricing and Quantity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Quantity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      className="form-input pl-8"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    className="form-input"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Unit *</label>
                  <select
                    name="unit"
                    className="form-input"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="form-label">District *</label>
                  <input
                    type="text"
                    name="location.district"
                    className="form-input"
                    placeholder="Enter district"
                    value={formData.location.district}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Harvest Date</label>
                  <input
                    type="date"
                    name="harvestDate"
                    className="form-input"
                    value={formData.harvestDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic Product</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images *</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="btn-primary cursor-pointer">
                        <Plus className="w-5 h-5 mr-2" />
                        Upload Images
                      </label>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Upload up to 5 images (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct; 