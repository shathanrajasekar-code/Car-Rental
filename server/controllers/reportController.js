const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get dashboard summary stats (Admin only)
// @route   GET /api/reports/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeRentals = await Booking.countDocuments({ status: 'Ongoing' });

    // Calculate revenue (only count paid bookings)
    const paidBookings = await Booking.find({
      status: { $in: ['Confirmed', 'Ongoing', 'Completed'] }
    });
    const totalRevenue = paidBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Get 5 recent bookings
    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('vehicle', 'brand model plateNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get count of available cars, rented, maintenance
    const availableFleet = await Vehicle.countDocuments({ status: 'Available' });
    const rentedFleet = await Vehicle.countDocuments({ status: 'Rented' });
    const maintenanceFleet = await Vehicle.countDocuments({ status: 'Maintenance' });

    res.json({
      success: true,
      data: {
        totalVehicles,
        totalBookings,
        activeRentals,
        totalRevenue,
        recentBookings,
        fleetStatus: {
          available: availableFleet,
          rented: rentedFleet,
          maintenance: maintenanceFleet
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly bookings/revenue for charts (Admin only)
// @route   GET /api/reports/revenue-chart
// @access  Private/Admin
const getRevenueChart = async (req, res) => {
  try {
    // Aggregation of revenue by month
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'Ongoing', 'Completed'] }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$pickupDate' }, year: { $year: '$pickupDate' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Map database results to chart-friendly formatting
    const formattedData = revenueData.map(item => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      bookings: item.bookings
    }));

    // If empty data, seed a dummy month for visualization
    if (formattedData.length === 0) {
      formattedData.push({ name: months[new Date().getMonth()], revenue: 0, bookings: 0 });
    }

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export bookings list as CSV
// @route   GET /api/reports/export-csv
// @access  Private/Admin
const exportBookingsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.pickupDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bookings = await Booking.find(dateFilter)
      .populate('customer', 'name email phone drivingLicense')
      .populate('vehicle', 'brand model plateNumber dailyPrice')
      .sort({ createdAt: -1 });

    // Construct CSV content manually
    let csvContent = 'Booking ID,Customer Name,Customer Email,Customer Phone,License Number,Vehicle,Plate Number,Daily Rate,Pickup Date,Return Date,Total Days,Total Amount,Status\n';
    
    bookings.forEach(b => {
      const customerName = b.customer ? b.customer.name : 'Deleted User';
      const customerEmail = b.customer ? b.customer.email : 'N/A';
      const customerPhone = b.customer ? b.customer.phone : 'N/A';
      const drivingLicense = b.customer ? b.customer.drivingLicense : 'N/A';
      const vehicleName = b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : 'Deleted Vehicle';
      const plateNumber = b.vehicle ? b.vehicle.plateNumber : 'N/A';
      const dailyPrice = b.vehicle ? b.vehicle.dailyPrice : 0;
      
      const pickupStr = new Date(b.pickupDate).toLocaleDateString();
      const returnStr = new Date(b.returnDate).toLocaleDateString();

      csvContent += `"${b._id}","${customerName}","${customerEmail}","${customerPhone}","${drivingLicense}","${vehicleName}","${plateNumber}",${dailyPrice},"${pickupStr}","${returnStr}",${b.totalDays},${b.totalAmount},"${b.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers (Admin only)
// @route   GET /api/reports/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Customer Block Status (Admin only)
// @route   PUT /api/reports/customers/:id/block
// @access  Private/Admin
const toggleBlockCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (customer.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrators cannot be blocked' });
    }

    customer.isBlocked = !customer.isBlocked;
    await customer.save();

    res.json({
      success: true,
      message: `Customer account ${customer.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueChart,
  exportBookingsCSV,
  getCustomers,
  toggleBlockCustomer
};
