import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Calendar, Sliders, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Vehicles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeCity } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Indian Brand & Model Cascade Lists (Expanded)
  const indianBrands = ['Tata', 'Maruti Suzuki', 'Hyundai', 'Honda', 'Mahindra', 'Toyota', 'Mercedes-Benz', 'Kia', 'MG', 'Skoda', 'Volkswagen'];
  const brandModelsMap = {
    'Tata': ['Tiago XZ+', 'Nexon XZ+'],
    'Maruti Suzuki': ['Swift ZXI+', 'Grand Vitara'],
    'Hyundai': ['Creta SX(O) IVT', 'Verna SX', 'i20 Asta'],
    'Honda': ['City ZX i-VTEC'],
    'Mahindra': ['XUV700 AX7 Luxury Pack', 'Thar LX'],
    'Toyota': ['Fortuner 4x4 Sigma 4', 'Innova Hycross'],
    'Mercedes-Benz': ['E-Class Expression E200'],
    'Kia': ['Seltos HTX', 'Sonet GTX+'],
    'MG': ['Hector Sharp Pro'],
    'Skoda': ['Kushaq Style'],
    'Volkswagen': ['Virtus GT TSI', 'Taigun GT']
  };

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Read URL query parameters on load (e.g. from Home search widget redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pDate = params.get('pickupDate');
    const rDate = params.get('returnDate');

    if (pDate) setPickupDate(pDate);
    if (rDate) setReturnDate(rDate);

    fetchVehicles(pDate, rDate);
  }, [location.search]);

  const fetchVehicles = async (pDate = pickupDate, rDate = returnDate) => {
    setLoading(true);
    try {
      let queryParams = [];
      if (search) queryParams.push(`search=${search}`);
      if (category) queryParams.push(`category=${category}`);
      if (selectedBrand) queryParams.push(`brand=${selectedBrand}`);
      if (selectedModel) queryParams.push(`model=${selectedModel}`);
      if (activeCity) queryParams.push(`city=${activeCity}`);
      if (transmission) queryParams.push(`transmission=${transmission}`);
      if (minPrice) queryParams.push(`minPrice=${minPrice}`);
      if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`);
      if (pDate) queryParams.push(`pickupDate=${pDate}`);
      if (rDate) queryParams.push(`returnDate=${rDate}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/vehicles${queryString}`);
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching fleet vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedBrand('');
    setSelectedModel('');
    setTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setPickupDate('');
    setReturnDate('');
    navigate('/vehicles');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
          Explore Our Fleet
        </h1>
        <p className="text-slate-500 mt-1">
          Select from our catalog of fully insured cars at transparent daily prices.
        </p>
      </div>

      {/* Filter and Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sliders size={18} className="text-primary-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-semibold"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-5">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Keyword Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g. Tesla, Honda"
                />
              </div>
            </div>

            {/* Date Picker Range (Availability search) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Check Date Availability</h4>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
            </div>

            {/* Brand Dropdown Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Brand Name
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                }}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Brands</option>
                {indianBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Model Dropdown Selector */}
            {selectedBrand && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Model Name
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">All Models</option>
                  {(brandModelsMap[selectedBrand] || []).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            {/* Transmission Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Transmission
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Transmissions</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Daily Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary-100"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Catalog Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-100 h-96 animate-pulse shadow-sm"></div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
              <Sparkles size={48} className="text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No Vehicles Found</h3>
              <p className="text-slate-400 max-w-md mx-auto text-sm">
                Try widening your date search parameters or resetting filters to explore the entire active fleet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((car) => {
                // Determine status badge classes
                let statusClass = '';
                if (car.status === 'Available') statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (car.status === 'Rented') statusClass = 'bg-sky-50 text-sky-700 border-sky-200';
                else if (car.status === 'Maintenance') statusClass = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={car._id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative aspect-video w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                      <img
                        src={car.image.startsWith('/uploads') ? `http://localhost:5000${car.image}` : car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-wide border border-slate-200 text-slate-600 shadow-sm">
                        {car.category}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusClass} flex-shrink-0`}>
                            {car.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{car.transmission}</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{car.fuelType}</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{car.seats} Seats</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{car.year}</span>
                          <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded font-bold">📍 {car.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                        <div>
                          <span className="text-xl font-extrabold text-slate-900">₹{car.dailyPrice}</span>
                          <span className="text-[10px] text-slate-400"> / Day</span>
                        </div>
                        <Link
                          to={`/vehicles/${car._id}${pickupDate && returnDate ? `?pickupDate=${pickupDate}&returnDate=${returnDate}` : ''}`}
                          className={`px-3 py-2 text-xs font-bold text-white rounded-lg transition-all ${
                            car.status === 'Maintenance'
                              ? 'bg-slate-300 cursor-not-allowed pointer-events-none'
                              : 'bg-primary-600 hover:bg-primary-700 shadow-sm'
                          }`}
                        >
                          {car.status === 'Rented' ? 'Check Booking' : 'Book Rental'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
