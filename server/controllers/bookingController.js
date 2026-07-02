const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Create a new booking (Customer only)
// @route   POST /api/bookings
// @access  Private/Customer
const createBooking = async (req, res) => {
  const { vehicleId, pickupDate, returnDate, tollRoute, tollEstimatedAmount, prepayTolls, carbonOffset } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'Maintenance') {
      return res.status(400).json({ success: false, message: 'Vehicle is currently under maintenance' });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid dates provided' });
    }

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Return date must be after pickup date' });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const compareStart = new Date(start);
    compareStart.setHours(0,0,0,0);
    if (compareStart < today) {
      return res.status(400).json({ success: false, message: 'Pickup date cannot be in the past' });
    }

    // Check date availability overlap
    const overlappingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['Pending', 'Confirmed', 'Ongoing'] },
      $or: [
        {
          pickupDate: { $lte: end },
          returnDate: { $gte: start }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already booked for these dates. Please choose another vehicle or different dates.'
      });
    }

    // Calculate number of days
    const diffTime = Math.abs(end - start);
    let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (totalDays === 0) totalDays = 1;

    // Pricing aggregates in INR (₹)
    const securityDeposit = 5000; // Refundable deposit of ₹5,000
    const basePrice = totalDays * vehicle.dailyPrice;
    const tollCost = prepayTolls ? Number(tollEstimatedAmount || 0) : 0;
    const carbonCost = carbonOffset ? 45 : 0; // GreenYatra carbon offsetting fee ₹45
    
    const totalAmount = basePrice + securityDeposit + tollCost + carbonCost;

    const booking = await Booking.create({
      customer: req.user._id,
      vehicle: vehicleId,
      pickupDate: start,
      returnDate: end,
      totalDays,
      totalAmount,
      securityDeposit,
      tollRoute: tollRoute || '',
      tollEstimatedAmount: Number(tollEstimatedAmount || 0),
      prepayTolls: !!prepayTolls,
      carbonOffset: !!carbonOffset,
      status: 'Pending'
    });

    await booking.populate('vehicle');

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bookings (Customer only)
// @route   GET /api/bookings/my-bookings
// @access  Private/Customer
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    let customerIds = [];
    if (search) {
      const customers = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'customer'
      }).select('_id');
      
      customerIds = customers.map(c => c._id);
      query.customer = { $in: customerIds };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone drivingLicense')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Admin / Customer cancellation)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Customer cancellation rules
    if (req.user.role === 'customer') {
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel bookings' });
      }

      if (booking.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (['Ongoing', 'Completed', 'Cancelled'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel booking with status: ${booking.status}`
        });
      }

      booking.status = 'Cancelled';
      await booking.save();

      const vehicle = await Vehicle.findById(booking.vehicle);
      if (vehicle && vehicle.status === 'Rented') {
        vehicle.status = 'Available';
        await vehicle.save();
      }

      return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    }

    // Admin updates
    if (req.user.role === 'admin') {
      const oldStatus = booking.status;
      booking.status = status;
      await booking.save();

      const vehicle = await Vehicle.findById(booking.vehicle);
      if (vehicle) {
        if (status === 'Ongoing') {
          vehicle.status = 'Rented';
          await vehicle.save();
        } else if (status === 'Completed') {
          vehicle.status = 'Available';
          await vehicle.save();
        } else if (status === 'Cancelled' && oldStatus === 'Ongoing') {
          vehicle.status = 'Available';
          await vehicle.save();
        }
      }

      return res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate crossing a FASTag toll gate
// @route   PUT /api/bookings/:id/toll-cross
// @access  Private/Customer
const simulateTollCross = async (req, res) => {
  const { plazaName, charge } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Append to toll log
    booking.tollLogs.push({
      plazaName,
      charge: Number(charge),
      timestamp: new Date()
    });

    booking.tollPaidAmount += Number(charge);
    await booking.save();

    res.json({ success: true, message: 'FASTag Toll gate cross simulated successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate speeding alert (SafarLock Geofence warning)
// @route   PUT /api/bookings/:id/speeding-alert
// @access  Private/Customer
const simulateSpeedingAlert = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    booking.overspeedAlertsCount += 1;
    await booking.save();

    res.json({ success: true, message: 'SafarLock overspeed warning recorded', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  updateBookingStatus,
  simulateTollCross,
  simulateSpeedingAlert
};
