import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Farmer's Market</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting farmers with buyers through a trusted marketplace. 
              Buy fresh produce, livestock, and farm products directly from local farmers.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:contact@farmersmarket.com" className="text-gray-300 hover:text-white transition-colors duration-200">
                <Mail size={20} />
              </a>
              <a href="tel:+1234567890" className="text-gray-300 hover:text-white transition-colors duration-200">
                <Phone size={20} />
              </a>
              <span className="text-gray-300">
                <MapPin size={20} />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Auctions
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Register as Farmer
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Farmer's Marketplace. All rights reserved.
          </p>
          <p className="text-gray-300 text-sm flex items-center space-x-1 mt-2 md:mt-0">
            <span>Made with</span>
            <Heart size={14} className="text-red-500" />
            <span>for farmers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 