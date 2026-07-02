import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import RatingStars from '../components/RatingStars';
import { Info, Download, Trash, Star, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState({}); // Tracking which booking is already reviewed locally

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch your bookings database. Try reloading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) {
      return;
    }

    try {
      const res = await api.put(`/bookings/${id}/status`, { status: 'Cancelled' });
      if (res.data.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleOpenReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    
    if (!reviewComment.trim()) {
      setReviewError('Please enter a comment for your review.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        alert('Thank you for your feedback! Review submitted.');
        setReviewedBookings(prev => ({ ...prev, [reviewBookingId]: true }));
        setShowReviewModal(false);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDownloadInvoice = (booking) => {
    // Generate Invoice PDF
    // Populate fake payment data if payment ref is object or missing
    const payment = booking.payment || { transactionId: 'MOCK-TXN-' + Math.floor(Math.random() * 90000) };
    const bookingData = {
      ...booking,
      customer: {
        name: user.name,
        email: user.email,
        drivingLicense: user.drivingLicense
      }
    };
    generateInvoicePDF(bookingData, payment);
  };

  const handleSimulateTollCross = async (booking) => {
    const routePlazas = {
      'Mumbai to Pune (Expressway)': [
        { name: 'Khalapur Toll Plaza', cost: 240 },
        { name: 'Urse Toll Plaza', cost: 80 }
      ],
      'Delhi to Jaipur (NH-48)': [
        { name: 'Kherki Daula Toll', cost: 80 },
        { name: 'Shahjahanpur Toll', cost: 150 },
        { name: 'Manohar Pur Toll', cost: 220 }
      ],
      'Bengaluru to Mysuru (NH-275)': [
        { name: 'Kaniminike Plaza', cost: 155 },
        { name: 'Sheshagiri Plaza', cost: 125 }
      ]
    };

    const plazas = routePlazas[booking.tollRoute] || [];
    if (plazas.length === 0) {
      alert('No toll route selected. You can select routes during checkout!');
      return;
    }

    const crossedPlazas = booking.tollLogs?.map(l => l.plazaName) || [];
    const nextPlaza = plazas.find(p => !crossedPlazas.includes(p.name));

    if (!nextPlaza) {
      alert('All toll gates on this route have already been crossed!');
      return;
    }

    try {
      const res = await api.put(`/bookings/${booking._id}/toll-cross`, {
        plazaName: nextPlaza.name,
        charge: nextPlaza.cost
      });

      if (res.data.success) {
        alert(`🚙 FASTag Auto-Deducted ₹${nextPlaza.cost} at ${nextPlaza.name}. Gate opened successfully!`);
        fetchBookings();
      }
    } catch (err) {
      alert('Failed to simulate toll gate cross.');
    }
  };

  const handleSimulateSpeeding = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/speeding-alert`);
      if (res.data.success) {
        alert(`🚨 SAFARLOCK EMERGENCY WARNING:\nYour speed exceeded 120 km/h (Expressway limit)!\n\n- Indian Road Safety alerts sent to admin.\n- Overspeed fine ₹2,000 recorded.`);
        fetchBookings();
      }
    } catch (err) {
      alert('Failed to record speeding alert.');
    }
  };

  const handlePayNow = (booking) => {
    navigate('/checkout', {
      state: {
        vehicle: booking.vehicle,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        totalDays: booking.totalDays,
        totalAmount: booking.totalAmount
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            My Bookings
          </h1>
          <p className="text-slate-500 mt-1">
            View booking status, print invoices, or manage active rentals.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Refresh List"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
          <Info size={40} className="text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Bookings Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-xs">
            You haven't rented any vehicles yet. Explore our fleet catalog and book today!
          </p>
          <button
            onClick={() => navigate('/vehicles')}
            className="inline-block mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Browse Fleet Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            // Determine status colors
            let statusColor = '';
            if (b.status === 'Pending') statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
            else if (b.status === 'Confirmed') statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (b.status === 'Ongoing') statusColor = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (b.status === 'Completed') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (b.status === 'Cancelled') statusColor = 'bg-slate-100 text-slate-500 border-slate-200';

            const isPending = b.status === 'Pending';
            const isConfirmed = b.status === 'Confirmed';
            const isOngoing = b.status === 'Ongoing';
            const isCompleted = b.status === 'Completed';

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row gap-6 p-6"
              >
                {/* Vehicle Thumbnail */}
                <div className="w-full md:w-48 aspect-video md:aspect-auto md:h-32 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img
                    src={b.vehicle?.image.startsWith('/uploads') ? `http://localhost:5000${b.vehicle.image}` : b.vehicle?.image}
                    alt={b.vehicle?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>

                {/* Details info */}
                <div className="flex-grow space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Plate Number: <span className="font-semibold">{b.vehicle?.plateNumber}</span></p>
                    </div>
                    <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-full ${statusColor}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Pickup Date</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{new Date(b.pickupDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Return Date</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{new Date(b.returnDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Duration</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{b.totalDays} {b.totalDays === 1 ? 'Day' : 'Days'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Price Paid</p>
                      <p className="font-extrabold text-primary-600 mt-0.5">₹{b.totalAmount}.00</p>
                    </div>
                  </div>

                  {/* Indian Unique Value Add Panels */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
                    {/* FASTag Widget */}
                    {b.prepayTolls && b.tollRoute && (
                      <div className="space-y-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>💳 FASTag Auto-Toll Tracker</span>
                          <span className="text-emerald-600 text-[10px]">Active Route: {b.tollRoute}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-center bg-white p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Est. Toll Pre-paid</p>
                            <p className="font-bold text-slate-800 mt-0.5">₹{b.tollEstimatedAmount}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Tolls Deducted</p>
                            <p className="font-bold text-slate-800 mt-0.5">₹{b.tollPaidAmount}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">FASTag Balance</p>
                            <p className={`font-bold mt-0.5 ${b.tollEstimatedAmount - b.tollPaidAmount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              ₹{b.tollEstimatedAmount - b.tollPaidAmount}
                            </p>
                          </div>
                        </div>

                        {/* Toll Logs */}
                        {b.tollLogs && b.tollLogs.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Toll deductions log:</p>
                            <div className="space-y-1">
                              {b.tollLogs.map((log, index) => (
                                <div key={index} className="flex justify-between text-[10px] text-slate-500 bg-white/50 px-2 py-1 rounded border border-slate-100">
                                  <span>🚗 {log.plazaName}</span>
                                  <span className="font-bold text-slate-700">₹{log.charge}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {isOngoing && (
                          <button
                            onClick={() => handleSimulateTollCross(b)}
                            className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                          >
                            Simulate Toll Gate Cross (FASTag Auto-pay)
                          </button>
                        )}
                      </div>
                    )}

                    {/* Geofencing SafarLock Widget */}
                    <div className="space-y-2 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>🔒 SafarLock Speed Limiter Geofencing</span>
                        {b.overspeedAlertsCount > 0 ? (
                          <span className="text-rose-600 font-black animate-pulse">🚨 SPEED WARNINGS: {b.overspeedAlertsCount}</span>
                        ) : (
                          <span className="text-emerald-600">Status: Safe Speeding</span>
                        )}
                      </div>

                      {b.overspeedAlertsCount > 0 && (
                        <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-[10px] text-rose-700 leading-normal">
                          <strong>Emergency Warning:</strong> Overspeed limit (120 km/h) exceeded. India RTO systems notified. A fine of ₹{b.overspeedAlertsCount * 2000} is logged against your security deposit.
                        </div>
                      )}

                      {isOngoing && (
                        <button
                          onClick={() => handleSimulateSpeeding(b._id)}
                          className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                        >
                          Simulate Speeding (Trigger Geofence Warning)
                        </button>
                      )}
                    </div>

                    {/* GreenYatra Impact Tracker */}
                    {b.carbonOffset && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-[10px] last:mb-0">
                        <span>🌳</span>
                        <div>
                          <strong>GreenYatra Carbon Offset Impact:</strong> Your trip offsets 42 kg of CO₂ by planting 1 tree in local reforestation reserves. Thank you for booking clean!
                        </div>
                      </div>
                    )}

                    {/* Bharath Yatra Itinerary Planner */}
                    {b.tollRoute && (
                      <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-3 text-[10px] text-primary-950 space-y-1.5">
                        <p className="font-bold flex items-center gap-1">🧭 Bharath Yatra Pitstop Recommendations:</p>
                        {b.tollRoute.includes('Mumbai') ? (
                          <ul className="list-disc pl-4 space-y-0.5 text-primary-900">
                            <li><strong>Sunny Da Dhaba</strong> - Famous for authentic local butter chicken and lassi.</li>
                            <li><strong>Lonavala Wax Museum</strong> - Perfect tourist stopover for a 30-min break.</li>
                            <li><strong>Khandala Ghat viewpoint</strong> - Beautiful scenic photography spot.</li>
                          </ul>
                        ) : b.tollRoute.includes('Delhi') ? (
                          <ul className="list-disc pl-4 space-y-0.5 text-primary-900">
                            <li><strong>Lakhmi Dhaba</strong> - Traditional Indian parathas and clay-pot tea.</li>
                            <li><strong>Neemrana Fort Palace</strong> - Beautiful 15th-century historical fort.</li>
                            <li><strong>Behror Midway</strong> - Safe food pitstop operated by Rajasthan Tourism.</li>
                          </ul>
                        ) : (
                          <ul className="list-disc pl-4 space-y-0.5 text-primary-900">
                            <li><strong>Maddur Tiffany's</strong> - Iconic spot for Crispy Maddur Vada.</li>
                            <li><strong>Channapatna Toys Market</strong> - Browse local handmade wooden toys.</li>
                            <li><strong>Srirangapatna Fort</strong> - Historical island fortress of Tipu Sultan.</li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">
                    {/* Pay Now if payment failed (remains pending) */}
                    {isPending && (
                      <button
                        onClick={() => handlePayNow(b)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Complete Payment
                      </button>
                    )}

                    {/* Download Invoice (for confirmed, ongoing, completed) */}
                    {(isConfirmed || isOngoing || isCompleted) && (
                      <button
                        onClick={() => handleDownloadInvoice(b)}
                        className="inline-flex items-center gap-1 px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        <Download size={14} />
                        <span>Download Invoice</span>
                      </button>
                    )}

                    {/* Write Review for completed, only if not yet reviewed */}
                    {isCompleted && !reviewedBookings[b._id] && (
                      <button
                        onClick={() => handleOpenReview(b._id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <Star size={14} />
                        <span>Write Review</span>
                      </button>
                    )}

                    {/* Cancel booking (only if pending or confirmed) */}
                    {(isPending || isConfirmed) && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs transition-colors ml-auto"
                      >
                        <Trash size={14} />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal Form */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Write Vehicle Review</h3>
              <p className="text-xs text-slate-500 mt-1">Rate your rental experience with the vehicle.</p>
            </div>

            {reviewError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Star Rating
                </label>
                <RatingStars
                  rating={reviewRating}
                  interactive={true}
                  onRatingChange={(val) => setReviewRating(val)}
                  size={24}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Comments / Feedback
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  required
                  placeholder="Share your driving experience. Was the car clean? How did it handle?"
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-55"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
