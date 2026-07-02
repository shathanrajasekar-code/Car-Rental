import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Car size={16} />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Bharath<span className="text-primary-400">Rentals</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Premium car rental solutions for business and leisure. Experience comfort, reliability, and modern fleet choices at best daily rates.
            </p>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Vehicles Fleet</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-400" />
                <span>123 University Avenue, Academic Campus</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary-400" />
                <span>support@bharathrentals.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Bharath Rentals. Academic Project Demo Submission. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
