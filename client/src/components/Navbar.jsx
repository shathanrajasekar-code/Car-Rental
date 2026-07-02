import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, User, LogOut, FileText, Calendar, Settings, ShieldAlert, MapPin, Compass } from 'lucide-react';

const Navbar = () => {
  const { user, logout, activeCity, setActiveCity, detectLocationAndSetCity } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const mobileLinkClass = (path) =>
    `block px-3 py-2 rounded-lg text-base font-medium transition-all ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg text-white group-hover:scale-105 transition-transform">
                <Car size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                Bharath<span className="text-primary-600">Rentals</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Common Public/Customer Links */}
            {!user || user.role === 'customer' ? (
              <>
                <Link to="/" className={linkClass('/')}>Home</Link>
                <Link to="/vehicles" className={linkClass('/vehicles')}>Browse Fleet</Link>
                <Link to="/about" className={linkClass('/about')}>About Us</Link>
                <Link to="/contact" className={linkClass('/contact')}>Contact Us</Link>
                <Link to="/terms" className={linkClass('/terms')}>Driving Terms</Link>
                {user && (
                  <>
                    <Link to="/my-bookings" className={linkClass('/my-bookings')}>My Bookings</Link>
                    <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
                  </>
                )}
              </>
            ) : (
              /* Admin Links */
              <>
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>Dashboard</Link>
                <Link to="/admin/vehicles" className={linkClass('/admin/vehicles')}>Manage Vehicles</Link>
                <Link to="/admin/bookings" className={linkClass('/admin/bookings')}>Manage Bookings</Link>
                <Link to="/admin/customers" className={linkClass('/admin/customers')}>Customers</Link>
                <Link to="/admin/reports" className={linkClass('/admin/reports')}>Reports</Link>
              </>
            )}
          </div>

          {/* Location Selector Widget */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700">
            <MapPin size={14} className="text-primary-600 flex-shrink-0" />
            <select
              value={activeCity}
              onChange={(e) => {
                setActiveCity(e.target.value);
                // Refresh catalog page if on /vehicles route
                if (location.pathname === '/vehicles') {
                  window.location.reload();
                }
              }}
              className="bg-transparent font-bold border-none text-slate-800 text-xs focus:ring-0 focus:outline-none cursor-pointer pr-5"
            >
              <optgroup label="Tamil Nadu Cities">
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Trichy">Trichy</option>
                <option value="Salem">Salem</option>
              </optgroup>
              <optgroup label="Metro Cities">
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
              </optgroup>
            </select>
            <button
              onClick={() => {
                detectLocationAndSetCity();
                // Refresh if needed
                setTimeout(() => {
                  if (location.pathname === '/vehicles') {
                    window.location.reload();
                  }
                }, 1000);
              }}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-primary-600 rounded-lg transition-colors flex items-center justify-center"
              title="Detect Location via GPS"
            >
              <Compass size={14} />
            </button>
          </div>

          {/* User Section / CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-700 text-sm font-medium border border-slate-200">
                  <User size={14} className="text-primary-600" />
                  <span>{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full flex items-center gap-1">
                      <ShieldAlert size={10} /> Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md hover:shadow-primary-100 hover:scale-[1.02] active:scale-[0.98] transition-all font-display"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user || user.role === 'customer' ? (
              <>
                <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkClass('/')}>Home</Link>
                <Link to="/vehicles" onClick={() => setIsOpen(false)} className={mobileLinkClass('/vehicles')}>Browse Fleet</Link>
                <Link to="/about" onClick={() => setIsOpen(false)} className={mobileLinkClass('/about')}>About Us</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className={mobileLinkClass('/contact')}>Contact Us</Link>
                <Link to="/terms" onClick={() => setIsOpen(false)} className={mobileLinkClass('/terms')}>Driving Terms</Link>
                {user && (
                  <>
                    <Link to="/my-bookings" onClick={() => setIsOpen(false)} className={mobileLinkClass('/my-bookings')}>My Bookings</Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className={mobileLinkClass('/profile')}>Profile</Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/dashboard')}>Dashboard</Link>
                <Link to="/admin/vehicles" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/vehicles')}>Manage Vehicles</Link>
                <Link to="/admin/bookings" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/bookings')}>Manage Bookings</Link>
                <Link to="/admin/customers" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/customers')}>Customers</Link>
                <Link to="/admin/reports" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/reports')}>Reports</Link>
              </>
            )}

            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-200 mt-2">
                <div className="flex items-center px-3 mb-3">
                  <div className="flex-shrink-0">
                    <User className="h-10 w-10 p-2 bg-slate-100 text-primary-600 rounded-full" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800">{user.name}</div>
                    <div className="text-sm font-medium text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-200 mt-2 flex flex-col gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
