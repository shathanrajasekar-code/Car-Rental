const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const fs = require('fs');
const path = require('path');

// @desc    Get all vehicles (with filters & search & availability check)
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const { category, transmission, fuelType, status, search, minPrice, maxPrice, pickupDate, returnDate, brand, model, city } = req.query;
    let query = {};

    if (city) {
      query.city = city;
    }

    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (model) {
      query.model = model;
    }
    if (transmission) {
      query.transmission = transmission;
    }
    if (fuelType) {
      query.fuelType = fuelType;
    }
    if (status) {
      query.status = status;
    }
    
    if (minPrice || maxPrice) {
      query.dailyPrice = {};
      if (minPrice) query.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) query.dailyPrice.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    // Availability validation by dates
    if (pickupDate && returnDate) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);

      if (!isNaN(start) && !isNaN(end)) {
        // Find overlapping bookings
        const overlappingBookings = await Booking.find({
          status: { $in: ['Pending', 'Confirmed', 'Ongoing'] },
          $or: [
            {
              pickupDate: { $lte: end },
              returnDate: { $gte: start }
            }
          ]
        }).select('vehicle');

        const unavailableVehicleIds = overlappingBookings.map(b => b.vehicle);
        query._id = { $nin: unavailableVehicleIds };
        
        // When checking availability by date, only show vehicles that are active/available
        query.status = 'Available';
      }
    }

    const vehicles = await Vehicle.find(query);
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Fetch reviews for this vehicle
    const reviews = await Review.find({ vehicle: req.params.id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((total / reviews.length).toFixed(1));
    }

    res.json({
      success: true,
      data: {
        ...vehicle.toObject(),
        reviews,
        averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const createVehicle = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      category,
      transmission,
      fuelType,
      seats,
      dailyPrice,
      plateNumber,
      status,
      city
    } = req.body;

    const plateExists = await Vehicle.findOne({ plateNumber });
    if (plateExists) {
      return res.status(400).json({ success: false, message: 'Plate number already registered' });
    }

    // File upload path
    let imagePath = '/uploads/default-car.png';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const vehicle = await Vehicle.create({
      name,
      brand,
      model,
      year: Number(year),
      category,
      transmission,
      fuelType,
      seats: Number(seats),
      dailyPrice: Number(dailyPrice),
      plateNumber,
      status: status || 'Available',
      image: imagePath,
      city: city || 'Chennai'
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // If updating plate number, check unique constraints
    if (req.body.plateNumber && req.body.plateNumber !== vehicle.plateNumber) {
      const plateExists = await Vehicle.findOne({ plateNumber: req.body.plateNumber });
      if (plateExists) {
        return res.status(400).json({ success: false, message: 'Plate number already registered' });
      }
    }

    // Prepare fields to update
    const fieldsToUpdate = { ...req.body };

    // If new file upload, update image path
    if (req.file) {
      // Try to delete old image if it's not the default one
      if (vehicle.image && vehicle.image !== '/uploads/default-car.png' && vehicle.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', vehicle.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      fieldsToUpdate.image = `/uploads/${req.file.filename}`;
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Delete associated image file from disk if applicable
    if (vehicle.image && vehicle.image !== '/uploads/default-car.png' && vehicle.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', vehicle.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete reviews and bookings associated to this vehicle (clean cascading delete)
    await Review.deleteMany({ vehicle: req.params.id });
    await Booking.deleteMany({ vehicle: req.params.id });
    await vehicle.deleteOne();

    res.json({ success: true, message: 'Vehicle and associated data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
