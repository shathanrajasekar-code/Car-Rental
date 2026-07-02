const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookings,
  updateBookingStatus,
  simulateTollCross,
  simulateSpeedingAlert
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my-bookings', protect, authorize('customer'), getMyBookings);
router.get('/', protect, authorize('admin'), getBookings);
router.put('/:id/status', protect, updateBookingStatus);

// Simulated Unique Features Routes
router.put('/:id/toll-cross', protect, authorize('customer'), simulateTollCross);
router.put('/:id/speeding-alert', protect, authorize('customer'), simulateSpeedingAlert);

module.exports = router;
