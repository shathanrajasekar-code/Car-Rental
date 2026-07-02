import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { UserMinus, UserCheck, Search, AlertCircle, RefreshCw } from 'lucide-react';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Searching customer name
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/reports/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch customers database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id, isBlocked, name) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} customer "${name}"?`)) {
      return;
    }

    try {
      const res = await api.put(`/reports/customers/${id}/block`);
      if (res.data.success) {
        alert(`User account ${isBlocked ? 'unblocked' : 'blocked'} successfully.`);
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  // Filter customers based on search keyword client-side
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Manage Customers
          </h1>
          <p className="text-slate-500 mt-1">
            Browse registered clients, verify licenses, and manage account access blocks.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
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

      {/* Filter search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            placeholder="Search by name, email, phone..."
          />
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading customers database...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">No registered customers match.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Driving License</th>
                  <th className="py-3.5 px-6">Registered Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-6">{c.email}</td>
                    <td className="py-3.5 px-6">{c.phone}</td>
                    <td className="py-3.5 px-6 font-semibold">{c.drivingLicense}</td>
                    <td className="py-3.5 px-6">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.isBlocked
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {c.isBlocked ? (
                        <button
                          onClick={() => handleToggleBlock(c._id, c.isBlocked, c.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-600 rounded-lg font-bold text-[10px] transition-colors"
                        >
                          <UserCheck size={12} />
                          <span>Unblock Account</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(c._id, c.isBlocked, c.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg font-bold text-[10px] transition-colors"
                        >
                          <UserMinus size={12} />
                          <span>Block Account</span>
                        </button>
                      )}
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

export default ManageCustomers;
