const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  pickupDate: {
    type: Date,
    required: [true, 'Please add a pickup date']
  },
  returnDate: {
    type: Date,
    required: [true, 'Please add a return date']
  },
  totalDays: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  securityDeposit: {
    type: Number,
    default: 5000
  },
  tollRoute: {
    type: String,
    default: ''
  },
  tollEstimatedAmount: {
    type: Number,
    default: 0
  },
  prepayTolls: {
    type: Boolean,
    default: false
  },
  tollPaidAmount: {
    type: Number,
    default: 0
  },
  tollLogs: [{
    plazaName: { type: String, required: true },
    charge: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  carbonOffset: {
    type: Boolean,
    default: false
  },
  overspeedAlertsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
