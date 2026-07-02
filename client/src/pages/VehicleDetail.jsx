import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import { Calendar, User, Info, ArrowLeft, Fuel, Disc, Users, ClipboardCheck, MessageSquare } from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking details form state
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingError, setBookingError] = useState('');

  // Sync dates from URL params if available (transferred from Catalog search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pDate = params.get('pickupDate');
    const rDate = params.get('returnDate');
    if (pDate) setPickupDate(pDate);
    if (rDate) setReturnDate(rDate);
  }, [location.search]);

  // Fetch single vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        if (res.data.success) {
          setVehicle(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve vehicle details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  // Recalculate price breakdown when dates change
  useEffect(() => {
    if (pickupDate && returnDate && vehicle) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      
      if (!isNaN(start) && !isNaN(end) && start < end) {
        const diffTime = Math.abs(end - start);
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days === 0) days = 1;

        setTotalDays(days);
        setTotalAmount(days * vehicle.dailyPrice);
        setBookingError('');
      } else {
        setTotalDays(0);
        setTotalAmount(0);
      }
    }
  }, [pickupDate, returnDate, vehicle]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      setBookingError('Administrators cannot book vehicles. Please log in as a Customer.');
      return;
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
      setBookingError('Pickup date cannot be in the past');
      return;
    }

    if (start >= end) {
      setBookingError('Return date must be after pickup date');
      return;
    }

    // Redirect to mock payment checkout page passing state variables
    navigate('/checkout', {
      state: {
        vehicle,
        pickupDate,
        returnDate,
        totalDays,
        totalAmount
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-rose-700">
          <Info size={40} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold">Error Loading Vehicle</h3>
          <p className="mt-2 text-sm">{error || 'Vehicle not found.'}</p>
          <Link to="/vehicles" className="inline-flex items-center gap-1 mt-6 text-sm font-semibold text-primary-600 hover:text-primary-700">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Vehicle Details and Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-[21/9] w-full bg-slate-100 relative">
              <img
                src={vehicle.image.startsWith('/uploads') ? `http://localhost:5000${vehicle.image}` : vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200';
                }}
              />
              <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                vehicle.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                vehicle.status === 'Rented' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {vehicle.status}
              </span>
            </div>
            
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars rating={vehicle.averageRating} size={16} />
                    <span className="text-sm font-bold text-slate-700">{vehicle.averageRating || 'No reviews'}</span>
                    <span className="text-xs text-slate-400">({vehicle.reviews?.length || 0} customer reviews)</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-3xl font-extrabold text-slate-900">₹{vehicle.dailyPrice}</span>
                  <span className="text-sm text-slate-400"> / Day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-950">Technical Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                <Fuel size={20} className="text-primary-600" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Fuel Type</span>
                <span className="text-sm font-semibold text-slate-800">{vehicle.fuelType}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                <Disc size={20} className="text-primary-600" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Transmission</span>
                <span className="text-sm font-semibold text-slate-800">{vehicle.transmission}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                <Users size={20} className="text-primary-600" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Capacity</span>
                <span className="text-sm font-semibold text-slate-800">{vehicle.seats} Seats</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                <ClipboardCheck size={20} className="text-primary-600" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Plate Number</span>
                <span className="text-sm font-semibold text-slate-800">{vehicle.plateNumber}</span>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-950">Premium Vehicle Features</h2>
              <div className="flex flex-wrap gap-2.5">
                {vehicle.features.map((feat, index) => (
                  <span key={index} className="px-3.5 py-1.5 bg-primary-50 text-primary-700 font-semibold text-xs rounded-xl border border-primary-100">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules & Regulations */}
          {vehicle.rules && vehicle.rules.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-950">Driving Rules & Policies</h2>
              <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                {vehicle.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Customer Reviews Listing */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary-600" />
              <span>Customer Reviews ({vehicle.reviews?.length || 0})</span>
            </h2>

            {vehicle.reviews?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No reviews left for this vehicle yet. Rent this car and be the first to share your feedback!
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {vehicle.reviews.map((rev) => (
                  <div key={rev._id} className="pt-6 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                          {rev.customer?.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{rev.customer?.name}</span>
                          <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} size={14} />
                    </div>
                    <p className="text-sm text-slate-600 pl-10 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Booking Widget */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Book This Vehicle</h3>
              <p className="text-xs text-slate-500 mt-1">
                Availability verification checks overlap restrictions automatically.
              </p>
            </div>

            {bookingError && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {vehicle.status !== 'Available' ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-2">
                <p className="text-sm font-bold text-slate-600">Vehicle Currently Unavailable</p>
                <p className="text-xs text-slate-400">
                  This car is marked as <span className="font-semibold text-primary-600">{vehicle.status}</span> and cannot accept bookings.
                </p>
                <Link
                  to="/vehicles"
                  className="inline-block mt-2 w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg text-center"
                >
                  Browse Available Cars
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Return Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>

                {/* Price Summary Panel */}
                {totalDays > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Breakdown</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Daily Rental Rate</span>
                      <span className="font-semibold text-slate-700">₹{vehicle.dailyPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Duration</span>
                      <span className="font-semibold text-slate-700">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 font-bold mt-2">
                      <span className="text-slate-900">Base Rental Cost</span>
                      <span className="text-primary-600 font-extrabold">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 border-t border-slate-100 pt-2">
                      <span>Refundable Security Deposit</span>
                      <span>₹5,000</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 font-bold mt-1 text-slate-900">
                      <span>Estimated Total</span>
                      <span className="text-slate-950 font-black">₹{totalAmount + 5000}</span>
                    </div>
                  </div>
                )}

                {/* Confirm CTA */}
                {user ? (
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary-100 hover:scale-[1.01]"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full py-3 bg-slate-800 hover:bg-slate-950 text-white text-sm font-semibold rounded-xl text-center shadow-md transition-all hover:scale-[1.01]"
                    >
                      Login to Book
                    </Link>
                    <p className="text-[10px] text-slate-400 text-center">
                      Registration takes under a minute. Simple driving license verification.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
