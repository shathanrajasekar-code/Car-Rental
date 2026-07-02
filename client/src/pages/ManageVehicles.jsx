import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash, Search, X, AlertCircle } from 'lucide-react';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [categoryField, setCategoryField] = useState('Sedan');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [seats, setSeats] = useState(5);
  const [dailyPrice, setDailyPrice] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [statusField, setStatusField] = useState('Available');
  const [city, setCity] = useState('Chennai');
  const [imageFile, setImageFile] = useState(null); // File upload
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      let queryParams = [];
      if (search) queryParams.push(`search=${search}`);
      if (category) queryParams.push(`category=${category}`);
      if (status) queryParams.push(`status=${status}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/vehicles${queryString}`);
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch vehicles database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, category, status]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedVehicleId(null);
    setName('');
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear());
    setCategoryField('Sedan');
    setTransmission('Automatic');
    setFuelType('Petrol');
    setSeats(5);
    setDailyPrice('');
    setPlateNumber('');
    setStatusField('Available');
    setCity('Chennai');
    setImageFile(null);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (car) => {
    setModalMode('edit');
    setSelectedVehicleId(car._id);
    setName(car.name);
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setCategoryField(car.category);
    setTransmission(car.transmission);
    setFuelType(car.fuelType);
    setSeats(car.seats);
    setDailyPrice(car.dailyPrice);
    setPlateNumber(car.plateNumber);
    setStatusField(car.status);
    setCity(car.city || 'Chennai');
    setImageFile(null);
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This will delete all associated bookings and reviews!')) {
      return;
    }

    try {
      const res = await api.delete(`/vehicles/${id}`);
      if (res.data.success) {
        alert('Vehicle deleted successfully.');
        fetchVehicles();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !brand || !model || !year || !dailyPrice || !plateNumber) {
      setFormError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    // Build FormData structure for file uploading support
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('category', categoryField);
    formData.append('transmission', transmission);
    formData.append('fuelType', fuelType);
    formData.append('seats', seats);
    formData.append('dailyPrice', dailyPrice);
    formData.append('plateNumber', plateNumber);
    formData.append('status', statusField);
    formData.append('city', city);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/vehicles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.put(`/vehicles/${selectedVehicleId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        alert(`Vehicle ${modalMode === 'add' ? 'added' : 'updated'} successfully.`);
        setShowModal(false);
        fetchVehicles();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Manage Fleet Vehicles
          </h1>
          <p className="text-slate-500 mt-1">
            Perform vehicle CRUD updates, upload images, and control statuses.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start"
        >
          <Plus size={16} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
            placeholder="Search by brand/model..."
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
        >
          <option value="">All Categories</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Luxury">Luxury</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Rented">Rented</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading fleet details...</div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">No vehicles registered. Click Add New Vehicle to populate.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-6">Vehicle info</th>
                  <th className="py-3.5 px-6">Plate Number</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Rate / Day</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {vehicles.map((car) => (
                  <tr key={car._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 flex items-center gap-3">
                      <img
                        src={car.image.startsWith('/uploads') ? `http://localhost:5000${car.image}` : car.image}
                        alt={car.name}
                        className="w-14 h-10 object-cover bg-slate-100 rounded-lg border border-slate-200"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                      <div>
                        <p className="font-bold text-slate-900">{car.brand} {car.model}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{car.transmission} • {car.fuelType}</p>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-semibold">{car.plateNumber}</td>
                    <td className="py-3 px-6">{car.category}</td>
                    <td className="py-3 px-6 font-bold text-slate-900">₹{car.dailyPrice}.00</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        car.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        car.status === 'Rented' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right space-x-1 flex items-center justify-end h-16">
                      <button
                        onClick={() => handleOpenEditModal(car)}
                        className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                        title="Edit Details"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(car._id)}
                        className="p-1.5 border border-rose-100 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-950 capitalize">{modalMode} Fleet Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                    placeholder="e.g. Tesla"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                    placeholder="e.g. Model 3"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Model Spec *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                    placeholder="e.g. Long Range AWD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Manufacture Year *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Category *</label>
                  <select
                    value={categoryField}
                    onChange={(e) => setCategoryField(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Transmission *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Seats Capacity *</label>
                  <input
                    type="number"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Fuel Type *</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Daily Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">License Plate Number *</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                    placeholder="BMWM-CPE-04"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Status Field</label>
                  <select
                    value={statusField}
                    onChange={(e) => setStatusField(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">City Location *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-950 focus:outline-none"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Trichy">Trichy</option>
                    <option value="Salem">Salem</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Upload Vehicle Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-primary-600 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehicles;
