import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, DollarSign, Calendar, Landmark, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/reports/stats');
      const chartRes = await api.get('/reports/revenue-chart');
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (chartRes.data.success) {
        setChartData(chartRes.data.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard stats database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatusUpdate = async (id, status) => {
    if (!window.confirm(`Mark booking as ${status}?`)) {
      return;
    }

    try {
      const res = await api.put(`/bookings/${id}/status`, { status });
      if (res.data.success) {
        alert('Booking status updated.');
        fetchDashboardData(); // Refresh metrics
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Overview of rentals, fleet metrics, customer databases, and income summaries.
          </p>
        </div>
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition-colors self-start"
        >
          <span>Generate Detailed Reports</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">₹{stats?.totalRevenue || 0}.00</h3>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{stats?.totalBookings || 0}</h3>
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Car size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Rentals</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{stats?.activeRentals || 0}</h3>
          </div>
        </div>

        {/* Available Fleet */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Fleet</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{stats?.fleetStatus?.available || 0} / {stats?.totalVehicles || 0}</h3>
          </div>
        </div>
      </div>

      {/* Chart and Fleet metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts chart */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-950 text-base">Monthly Revenue Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <h3 className="font-bold text-slate-950 text-base">Fleet Operations</h3>
          
          <div className="space-y-4 flex-grow flex flex-col justify-center">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Available cars</span>
              <span className="font-bold text-slate-800">{stats?.fleetStatus?.available || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><Car size={16} className="text-primary-500" /> Rented out</span>
              <span className="font-bold text-slate-800">{stats?.fleetStatus?.rented || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><AlertCircle size={16} className="text-amber-500" /> Under Maintenance</span>
              <span className="font-bold text-slate-800">{stats?.fleetStatus?.maintenance || 0}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-2">
            <Link
              to="/admin/vehicles"
              className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
            >
              Add New Fleet Vehicles
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-950 text-base">Recent Rent Transactions</h3>
          <Link
            to="/admin/bookings"
            className="text-xs text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead>
              <tr className="text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Vehicle Rented</th>
                <th className="py-3 px-4">Schedule Dates</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Trip Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {stats?.recentBookings?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">No rental history found.</td>
                </tr>
              ) : (
                stats?.recentBookings?.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <p>{b.customer?.name || 'Deleted User'}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{b.customer?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold">{b.vehicle?.brand} {b.vehicle?.model}</p>
                      <p className="text-[10px] text-slate-400">{b.vehicle?.plateNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(b.pickupDate).toLocaleDateString()} - {new Date(b.returnDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <p>₹{b.totalAmount}.00</p>
                      {b.overspeedAlertsCount > 0 && (
                        <span className="inline-block text-[9px] text-rose-600 font-extrabold animate-pulse bg-rose-50 border border-rose-100 rounded px-1 mt-0.5">🚨 {b.overspeedAlertsCount} Speed Warning(s)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        b.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        b.status === 'Ongoing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleQuickStatusUpdate(b._id, 'Ongoing')}
                          className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-[10px] font-bold"
                        >
                          Mark Picked Up
                        </button>
                      )}
                      {b.status === 'Ongoing' && (
                        <button
                          onClick={() => handleQuickStatusUpdate(b._id, 'Completed')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
