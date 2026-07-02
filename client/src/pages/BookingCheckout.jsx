import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import { CreditCard, ArrowLeft, ShieldCheck, AlertCircle, Info, Calendar } from 'lucide-react';

const BookingCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if directly navigated without state
  useEffect(() => {
    if (!location.state || !location.state.vehicle) {
      navigate('/vehicles');
    }
  }, [location.state, navigate]);

  if (!location.state || !location.state.vehicle) {
    return null;
  }

  const { vehicle, pickupDate, returnDate, totalDays, totalAmount } = location.state;

  // Checkout form fields state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // FASTag & Carbon Offset States
  const [tollRoute, setTollRoute] = useState('');
  const [tollEstimatedAmount, setTollEstimatedAmount] = useState(0);
  const [prepayTolls, setPrepayTolls] = useState(false);
  const [carbonOffset, setCarbonOffset] = useState(false);

  // Toll route charges mapping
  const routeCharges = {
    '': 0,
    'Mumbai to Pune (Expressway)': 320,
    'Delhi to Jaipur (NH-48)': 450,
    'Bengaluru to Mysuru (NH-275)': 280
  };

  const handleRouteChange = (e) => {
    const route = e.target.value;
    setTollRoute(route);
    const charge = routeCharges[route] || 0;
    setTollEstimatedAmount(charge);
    setPrepayTolls(charge > 0);
  };
  
  // Failure simulation toggle
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create the Booking in 'Pending' status
      const bookingRes = await api.post('/bookings', {
        vehicleId: vehicle._id,
        pickupDate,
        returnDate,
        tollRoute,
        tollEstimatedAmount,
        prepayTolls,
        carbonOffset
      });

      if (!bookingRes.data.success) {
        setError(bookingRes.data.message || 'Failed to initialize booking.');
        setProcessing(false);
        return;
      }

      const booking = bookingRes.data.data;

      // Step 2: Call the mock checkout API
      const paymentRes = await api.post('/payments/checkout', {
        bookingId: booking._id,
        method: 'Card',
        simulateFailure
      });

      if (paymentRes.data.success) {
        setSuccess(true);
        // Link customer to booking structure so pdf generator populates name/email
        const completeBookingData = {
          ...booking,
          customer: {
            name: user.name,
            email: user.email,
            drivingLicense: user.drivingLicense
          }
        };

        // Trigger client-side invoice generation download
        generateInvoicePDF(completeBookingData, paymentRes.data.data.payment);

        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaction failed. Please try again.';
      setError(msg);
      
      // If booking was created but payment failed, redirect user to My Bookings so they can try again
      if (err.response?.data?.data?.booking) {
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <Link
          to={`/vehicles/${vehicle._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Details</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-4 font-sans">
          Checkout & Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Summary panel */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-4">Rental Summary</h2>
          
          <div className="flex gap-4">
            <img
              src={vehicle.image.startsWith('/uploads') ? `http://localhost:5000${vehicle.image}` : vehicle.image}
              alt={vehicle.name}
              className="w-24 h-16 object-cover bg-slate-100 rounded-lg border border-slate-200"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div>
              <h3 className="font-bold text-slate-950 text-sm">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-xs text-slate-400 mt-1 capitalize">{vehicle.category} • {vehicle.transmission}</p>
              <p className="text-xs text-slate-400 mt-0.5">{vehicle.plateNumber}</p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Pickup Date</span>
              <span className="font-semibold text-slate-800">{new Date(pickupDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Return Date</span>
              <span className="font-semibold text-slate-800">{new Date(returnDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-800">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Daily Rental rate</span>
              <span className="font-semibold text-slate-700">₹{vehicle.dailyPrice}.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Base Rent ({totalDays} Days)</span>
              <span className="font-semibold text-slate-700">₹{totalAmount}.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Refundable Security Deposit</span>
              <span className="font-semibold text-slate-700">₹5,000.00</span>
            </div>
            {prepayTolls && (
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>FASTag Pre-paid Tolls</span>
                <span>₹{tollEstimatedAmount}.00</span>
              </div>
            )}
            {carbonOffset && (
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>GreenYatra Carbon Offset</span>
                <span>₹45.00</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-200 pt-3">
              <span>Total Price</span>
              <span className="text-primary-600 text-lg">₹{totalAmount + 5000 + (prepayTolls ? tollEstimatedAmount : 0) + (carbonOffset ? 45 : 0)}.00</span>
            </div>
            <div className="text-[10px] text-slate-400 text-right italic pt-1">
              * ₹5,000 security deposit is 100% refundable upon vehicle return.
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-2">
            <ShieldCheck size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Your details are secured by 256-bit encryption. DriveEase rentals uses mock transaction check procedures for academic presentations.
            </p>
          </div>
        </div>

        {/* Right: Payment simulator */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950 border-b border-slate-100 pb-4">Payment Information</h2>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transaction Failed: </span>
                <span>{error}</span>
                <p className="mt-1 text-[10px] text-rose-500">
                  If the booking was created, you will be redirected to the bookings dashboard in 3 seconds.
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-2xl text-center space-y-3">
              <ShieldCheck size={40} className="text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold">Payment Simulator Successful!</h3>
              <p className="text-xs text-slate-500">
                Your reservation is confirmed. The PDF invoice is downloading to your device. Redirecting to My Bookings...
              </p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Simulator Switch */}
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between gap-4">
                <div className="flex gap-2.5">
                  <Info size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-primary-900">Payment Simulation Control</h4>
                    <p className="text-[10px] text-primary-700 leading-normal mt-0.5">
                      Toggle this to simulate card auth failure for viva demonstration purposes.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Indian Unique Features Selector Panels */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">Bharath Rental Unique Value-Add Options</h4>
                
                {/* 1. Toll Estimator Route Selector */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-semibold">FASTag Toll Route Estimator (Optional)</label>
                  <select
                    value={tollRoute}
                    onChange={handleRouteChange}
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="">No Route Selected (No Pre-paid FASTag Tolls)</option>
                    <option value="Mumbai to Pune (Expressway)">Mumbai to Pune (Expressway) - Est. ₹320</option>
                    <option value="Delhi to Jaipur (NH-48)">Delhi to Jaipur (NH-48) - Est. ₹450</option>
                    <option value="Bengaluru to Mysuru (NH-275)">Bengaluru to Mysuru (NH-275) - Est. ₹280</option>
                  </select>
                </div>

                {/* 2. FASTag Prepay checkbox */}
                {tollEstimatedAmount > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={prepayTolls}
                      onChange={(e) => setPrepayTolls(e.target.checked)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-700">Pre-pay FASTag Toll Balance</span>
                      <p className="text-[10px] text-slate-400">Pre-charges ₹{tollEstimatedAmount} to automatically cover tolls. Simulator will show auto-deductions.</p>
                    </div>
                  </label>
                )}

                {/* 3. GreenYatra Carbon Offset Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer border-t border-slate-200 pt-3">
                  <input
                    type="checkbox"
                    checked={carbonOffset}
                    onChange={(e) => setCarbonOffset(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-700">GreenYatra Carbon Offset Contribution (+₹45)</span>
                    <p className="text-[10px] text-slate-400">Offset the carbon footprint of this rental trip. Proceeds go to local tree-plantation projects.</p>
                  </div>
                </label>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Card Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <CreditCard size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength="19"
                      className="pl-10 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="4000 1234 5678 9010"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength="5"
                      className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      CVV Code
                    </label>
                    <input
                      type="password"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength="3"
                      className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-55 shadow-md shadow-primary-100 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {processing ? 'Processing Secure Transaction...' : `Pay Total ₹${totalAmount + 5000 + (prepayTolls ? tollEstimatedAmount : 0) + (carbonOffset ? 45 : 0)}.00`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
