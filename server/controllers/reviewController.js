const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add review for a vehicle (completed bookings only)
// @route   POST /api/reviews
// @access  Private/Customer
const addReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: not your booking' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be left for completed bookings' });
    }

    const reviewExists = await Review.findOne({ booking: bookingId });
    if (reviewExists) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
    }

    const review = await Review.create({
      customer: req.user._id,
      vehicle: booking.vehicle,
      booking: bookingId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addReview };
