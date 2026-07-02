const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a vehicle name']
  },
  brand: {
    type: String,
    required: [true, 'Please add a vehicle brand']
  },
  model: {
    type: String,
    required: [true, 'Please add a vehicle model']
  },
  year: {
    type: Number,
    required: [true, 'Please add a vehicle manufacturing year']
  },
  category: {
    type: String,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury'],
    required: [true, 'Please select a vehicle category']
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    required: [true, 'Please specify transmission type']
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: [true, 'Please specify fuel type']
  },
  seats: {
    type: Number,
    required: [true, 'Please specify number of seats']
  },
  dailyPrice: {
    type: Number,
    required: [true, 'Please add a daily price']
  },
  image: {
    type: String,
    required: [true, 'Please upload a vehicle image']
  },
  plateNumber: {
    type: String,
    required: [true, 'Please add a vehicle license plate number'],
    unique: true
  },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Maintenance'],
    default: 'Available'
  },
  city: {
    type: String,
    enum: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Bengaluru', 'Mumbai', 'Delhi'],
    default: 'Chennai'
  },
  features: {
    type: [String],
    default: []
  },
  rules: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
