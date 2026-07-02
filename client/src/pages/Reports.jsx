import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, RefreshCw, FileText, AlertCircle, Info } from 'lucide-react';

const Reports = () => {
  // Date range filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [bookingsPreview, setBookingsPreview] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // Fetch matching bookings for preview
      const previewRes = await api.get(`/bookings${queryString}`);
      // Fetch chart details
      const chartRes = await api.get('/reports/revenue-chart');

      if (previewRes.data.success) {
        setBookingsPreview(previewRes.data.data);
      }
      if (chartRes.data.success) {
        setChartData(chartRes.data.data);
      }
    } catch (err) {
      setError('Failed to aggregate reports data database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleDownloadCSV = async () => {
    try {
      let query = '';
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      // Fetch raw CSV blob from backend manual export endpoint
      const response = await api.get(`/reports/export-csv${query}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const startLabel = startDate ? startDate : 'ALL';
      const endLabel = endDate ? endDate : 'ALL';
      link.setAttribute('download', `bookings_report_${startLabel}_to_${endLabel}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate CSV download.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Analyze revenue aggregations, set date ranges, and export booking spreadsheet files.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Date Filter & Export panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-end gap-6 justify-between">
        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Apply Filter
          </button>
        </form>

        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs shadow-md shadow-primary-100 transition-all self-start md:self-end"
        >
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-950 text-base">Monthly Income Graph</h3>
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
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings Preview Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-950 text-base flex items-center gap-1.5">
          <FileText size={18} className="text-primary-600" />
          <span>Report Data Preview ({bookingsPreview.length} records)</span>
        </h3>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-6 text-center text-slate-400">Loading details...</div>
          ) : bookingsPreview.length === 0 ? (
            <div className="py-6 text-center text-slate-400 font-medium">No bookings found matching filters.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Vehicle Rented</th>
                  <th className="py-3 px-4">Pickup Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {bookingsPreview.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[10px] text-slate-500">{b._id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.customer?.name || 'Deleted User'}</td>
                    <td className="py-3 px-4 font-semibold">{b.vehicle?.brand} {b.vehicle?.model}</td>
                    <td className="py-3 px-4">{new Date(b.pickupDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(b.returnDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{b.totalAmount}.00</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
