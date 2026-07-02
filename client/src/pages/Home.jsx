import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Search, ArrowRight, ShieldCheck, Zap, HeartHandshake, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { activeCity } = useAuth();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search parameters for redirection
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get(`/vehicles?status=Available&city=${activeCity}`);
        if (res.data.success) {
          // Take first 3 vehicles
          setFeaturedCars(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured fleet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [activeCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (pickupDate && returnDate) {
      navigate(`/vehicles?pickupDate=${pickupDate}&returnDate=${returnDate}`);
    } else {
      navigate('/vehicles');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Call to Action Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-xs font-semibold tracking-wide text-primary-400">
                <Star size={12} className="fill-primary-400" /> Premium Rental Experience
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-sans">
                Rent The Perfect Ride For Your <span className="text-primary-400">Next Journey</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl">
                Choose from a curated collection of sedans, SUVs, hatchbacks, and luxury vehicles. Flexible booking, instant confirmations, and zero hidden fees.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25"
                >
                  Explore Fleet <ArrowRight size={16} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-sm font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Quick date search form widget */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-100 max-w-md mx-auto">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
                  Check Car Availability
                </h3>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        required
                        value={pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="pl-10 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Return Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        required
                        value={returnDate}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="pl-10 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-100 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Search size={18} />
                    <span>Search Available Cars</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
            Our Core Rental Benefits
          </h2>
          <p className="text-slate-500">
            We offer premium fleet maintenance, clear transaction logs, and full customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-950">Fully Insured Fleet</h3>
            <p className="text-sm text-slate-500">
              Each vehicle in our listing comes with comprehensive insurance coverage, allowing you to drive with total peace of mind.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-950">Instant Key Confirmations</h3>
            <p className="text-sm text-slate-500">
              No long validation queues. Book, complete our mock payment, and download your confirmation invoice instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-950">24/7 Road Support</h3>
            <p className="text-sm text-slate-500">
              Our campus administration and technical team are always available to help you in case of any issues with our rentals.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
              Featured Available Fleet
            </h2>
            <p className="text-slate-500 mt-2">
              Ready to pick up today. Inspect premium specs and book instantly.
            </p>
          </div>
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-2.5 transition-all"
          >
            <span>View All Vehicles</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse h-96"></div>
            ))}
          </div>
        ) : featuredCars.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500">
            No vehicles currently available. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full"
              >
                {/* Image Holder */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={car.image.startsWith('/uploads') ? `http://localhost:5000${car.image}` : car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold border border-slate-200">
                    {car.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {car.brand} {car.model}
                    </h3>
                    <div className="flex gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                      <span>{car.transmission}</span>
                      <span>•</span>
                      <span>{car.fuelType}</span>
                      <span>•</span>
                      <span>{car.seats} Seats</span>
                      <span>•</span>
                      <span className="font-bold text-primary-600">📍 {car.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">₹{car.dailyPrice}</span>
                      <span className="text-xs text-slate-400"> / Day</span>
                    </div>
                    <Link
                      to={`/vehicles/${car._id}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-slate-100 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
              Rent A Car In 4 Simple Steps
            </h2>
            <p className="text-slate-500">
              Our streamlined booking procedure gets you on the road in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-slate-900">Select Fleet</h3>
              <p className="text-sm text-slate-500">
                Browse our list of available vehicles and filter based on your parameters.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-slate-900">Set Date Range</h3>
              <p className="text-sm text-slate-500">
                Enter pickup and return dates. The system checks availability overlap protection.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-slate-900">Mock Payment</h3>
              <p className="text-sm text-slate-500">
                Simulate a checkout. Download the PDF invoice receipt instantly.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                4
              </div>
              <h3 className="font-bold text-slate-900">Collect Vehicle</h3>
              <p className="text-sm text-slate-500">
                Collect keys at the branch. Drive safely and return when rental completes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-600 text-white p-8 sm:p-16 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_var(--tw-gradient-stops))] from-primary-500 via-primary-600 to-primary-800 opacity-60"></div>
          <div className="relative z-10 max-w-xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">Ready to get started?</h2>
            <p className="text-primary-100">
              Create an account now to explore special student discounts and lock in available cars.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-primary-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
