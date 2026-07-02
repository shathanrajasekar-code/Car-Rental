const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { logMockEmail } = require('../utils/emailHelper');

// @desc    Process mock checkout payment
// @route   POST /api/payments/checkout
// @access  Private/Customer
const processCheckout = async (req, res) => {
  const { bookingId, method, simulateFailure } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('customer vehicle');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending status' });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (simulateFailure) {
      const payment = await Payment.create({
        booking: bookingId,
        amount: booking.totalAmount,
        status: 'Failed',
        transactionId,
        method: method || 'Card'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment simulation failed. Please check card credentials.',
        data: payment
      });
    }

    const payment = await Payment.create({
      booking: bookingId,
      amount: booking.totalAmount,
      status: 'Success',
      transactionId,
      method: method || 'Card'
    });

    booking.status = 'Confirmed';
    booking.payment = payment._id;
    await booking.save();

    const emailBody = `Dear ${booking.customer.name},

Thank you for booking with us! Your reservation is confirmed.

Booking Details:
- Vehicle: ${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.year})
- Plate Number: ${booking.vehicle.plateNumber}
- Pickup Date: ${new Date(booking.pickupDate).toDateString()}
- Return Date: ${new Date(booking.returnDate).toDateString()}
- Total Days: ${booking.totalDays}
- Total Price: $${booking.totalAmount.toFixed(2)}
- Transaction Reference: ${transactionId}

You can download your PDF invoice from your "My Bookings" page.

Safe travels,
The Car Rental Team`;

    await logMockEmail(booking.customer.email, 'Booking Confirmation - Car Rental System', emailBody);

    res.json({
      success: true,
      message: 'Payment mock successful. Booking confirmed!',
      data: {
        payment,
        booking
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processCheckout };
