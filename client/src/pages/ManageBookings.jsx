import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering parameters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchBookings = async () => {
    try {
      let queryParams = [];
      if (search) queryParams.push(`search=${search}`);
      if (status) queryParams.push(`status=${status}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/bookings${queryString}`);
      
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch bookings database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, status]);

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change booking status to ${newStatus}?`)) {
      return;
    }

    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        alert('Booking status updated successfully.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Manage Bookings
          </h1>
          <p className="text-slate-500 mt-1">
            Track rental reservations, verify driving licenses, and update vehicle status logs.
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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            placeholder="Search by customer name..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading bookings database...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">No bookings recorded.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-6">Customer details</th>
                  <th className="py-3.5 px-6">Vehicle Rented</th>
                  <th className="py-3.5 px-6">Schedule Dates</th>
                  <th className="py-3.5 px-6">Invoice Total</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {bookings.map((b) => {
                  let statusColor = '';
                  if (b.status === 'Pending') statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  else if (b.status === 'Confirmed') statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  else if (b.status === 'Ongoing') statusColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  else if (b.status === 'Completed') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (b.status === 'Cancelled') statusColor = 'bg-slate-100 text-slate-500 border-slate-200';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-slate-900">{b.customer?.name || 'Deleted User'}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{b.customer?.email} • {b.customer?.phone}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">License: {b.customer?.drivingLicense || 'N/A'}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="font-semibold">{b.vehicle?.brand} {b.vehicle?.model}</p>
                        <p className="text-[10px] text-slate-400">{b.vehicle?.plateNumber}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {new Date(b.pickupDate).toLocaleDateString()}</p>
                        <p className="flex items-center gap-1 mt-0.5"><Calendar size={12} className="text-slate-400" /> {new Date(b.returnDate).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">({b.totalDays} Days)</p>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        <p>₹{b.totalAmount}.00</p>
                        {b.overspeedAlertsCount > 0 && (
                          <span className="inline-block text-[9px] text-rose-600 font-extrabold animate-pulse bg-rose-50 border border-rose-100 rounded px-1.5 mt-0.5">🚨 {b.overspeedAlertsCount} Speed Warning(s)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-800 rounded font-semibold text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ongoing">Ongoing (Picked Up)</option>
                          <option value="Completed">Completed (Returned)</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
