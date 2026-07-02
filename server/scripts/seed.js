const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_rental_db';
    console.log(`Connecting to database: ${connStr}`);
    await mongoose.connect(connStr);

    console.log('Clearing database collections...');
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();

    console.log('Collections cleared.');

    // Seed Users
    console.log('Seeding users...');
    const admin = await User.create({
      name: 'Bharath Admin System',
      email: 'admin@carrental.com',
      phone: '+91 98765 43210',
      password: 'admin123',
      role: 'admin',
      drivingLicense: 'N/A'
    });

    const customer = await User.create({
      name: 'Rohan Sharma',
      email: 'customer@carrental.com',
      phone: '+91 99112 23344',
      password: 'customer123',
      role: 'customer',
      drivingLicense: 'DL-IND-1420239922'
    });

    console.log('Users seeded.');

    // Pool of base models
    const carsPool = [
      { name: 'Tata Tiago', brand: 'Tata', model: 'Tiago XZ+', category: 'Hatchback', transmission: 'Manual', fuelType: 'Petrol', seats: 5, dailyPrice: 1200, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', features: ['Harman Sound System', 'ABS with EBD', 'Dual Airbags'], rules: ['Speed limit 80 km/h', 'Same-to-same fuel policy'] },
      { name: 'Maruti Suzuki Swift', brand: 'Maruti Suzuki', model: 'Swift ZXI+', category: 'Hatchback', transmission: 'Manual', fuelType: 'Petrol', seats: 5, dailyPrice: 1400, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800', features: ['SmartPlay Pro Touchscreen', 'Keyless Push Start', 'LED Projector Lamps'], rules: ['Speed limit 80 km/h', 'No smoking inside'] },
      { name: 'Hyundai Creta', brand: 'Hyundai', model: 'Creta SX(O) IVT', category: 'SUV', transmission: 'Automatic', fuelType: 'Diesel', seats: 5, dailyPrice: 2800, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', features: ['Panoramic Sunroof', 'Ventilated Seats', 'Bose Premium Audio'], rules: ['Speed limit 100 km/h', 'FASTag pre-paid recommended'] },
      { name: 'Honda City', brand: 'Honda', model: 'City ZX i-VTEC', category: 'Sedan', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 2500, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', features: ['Honda Sensing ADAS', 'Electric Sunroof', 'LaneWatch Camera'], rules: ['Speed limit 90 km/h', 'No smoking inside'] },
      { name: 'Mahindra XUV700', brand: 'Mahindra', model: 'XUV700 AX7 Luxury', category: 'SUV', transmission: 'Automatic', fuelType: 'Diesel', seats: 7, dailyPrice: 4500, image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', features: ['Level 2 ADAS Adaptive Cruise', 'Sony 12-Speaker Sound', 'Skyroof (Panoramic)'], rules: ['Speed limit 120 km/h', 'Late return fine ₹500/hour'] },
      { name: 'Toyota Fortuner', brand: 'Toyota', model: 'Fortuner 4x4 Sigma 4', category: 'Luxury', transmission: 'Automatic', fuelType: 'Diesel', seats: 7, dailyPrice: 7500, image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800', features: ['Sigma 4x4 Drive Selector', 'Dual-Zone Climate Control', 'Power Tailgate'], rules: ['Speed limit 120 km/h', 'Off-roading not permitted'] },
      { name: 'Mercedes-Benz E-Class', brand: 'Mercedes-Benz', model: 'E-Class Expression', category: 'Luxury', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 18000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800', features: ['Panoramic Double Sunroof', 'Chauffeur Package', 'Burmester Surround Sound'], rules: ['Speed limit 120 km/h', 'Strict speed limiter active'] },
      { name: 'Kia Seltos', brand: 'Kia', model: 'Seltos HTX', category: 'SUV', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 3200, image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800', features: ['Kia Connect Telematics', 'Bose Sound System', 'Sunroof'], rules: ['Speed limit 100 km/h', 'Same-to-same fuel policy'] },
      { name: 'MG Hector', brand: 'MG', model: 'Hector Sharp Pro', category: 'SUV', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 3800, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800', features: ['14-inch HD Touchscreen', 'Panoramic Dual Sunroof', 'Level 2 ADAS Tech'], rules: ['Speed limit 100 km/h', 'No pets allowed inside'] },
      { name: 'Skoda Kushaq', brand: 'Skoda', model: 'Kushaq Style', category: 'SUV', transmission: 'Manual', fuelType: 'Petrol', seats: 5, dailyPrice: 3000, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800', features: ['TSI Turbo Engine', 'Wireless SmartLink', 'Ventilated front seats'], rules: ['Speed limit 100 km/h', 'Late return fine ₹500/hour'] },
      { name: 'Volkswagen Virtus', brand: 'Volkswagen', model: 'Virtus GT TSI', category: 'Sedan', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 3500, image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800', features: ['GT Performance Pack', '1.5L TSI Engine', 'Digital Cockpit Cluster'], rules: ['Speed limit 100 km/h', 'Same-to-same fuel policy'] },
      { name: 'Kia Sonet', brand: 'Kia', model: 'Sonet GTX+', category: 'SUV', transmission: 'Automatic', fuelType: 'Diesel', seats: 5, dailyPrice: 2000, image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800', features: ['Front Ventilated Seats', 'Subwoofer Speakers', 'Sporty Red Brake Calipers'], rules: ['Speed limit 80 km/h', 'No smoking inside the vehicle'] },
      { name: 'Volkswagen Taigun', brand: 'Volkswagen', model: 'Taigun GT', category: 'SUV', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, dailyPrice: 3300, image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800', features: ['ESC Stability Control', 'Wireless Charger Pad', 'TSI Performance Tech'], rules: ['Speed limit 100 km/h', 'Cleanliness fine ₹1,500'] },
      { name: 'Tata Nexon', brand: 'Tata', model: 'Nexon XZ+', category: 'SUV', transmission: 'Manual', fuelType: 'Diesel', seats: 5, dailyPrice: 2400, image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800', features: ['5-Star GNCAP Safety', 'Three Drive Modes', 'iRA Connected Tech'], rules: ['Speed limit 90 km/h', 'LMV license category mandatory'] },
      { name: 'Hyundai i20', brand: 'Hyundai', model: 'i20 Asta', category: 'Hatchback', transmission: 'Manual', fuelType: 'Petrol', seats: 5, dailyPrice: 1600, image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800', features: ['Wireless smart link', 'Bose Premium 7 Speakers', 'Smart Air Purifier'], rules: ['Speed limit 80 km/h', 'Refundable deposit ₹5,000'] }
    ];

    const targetCities = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Bengaluru', 'Mumbai', 'Delhi'];
    const seededVehicles = [];

    console.log('Generating 50 vehicles for each city location (total 400 cars)...');

    for (const city of targetCities) {
      const stateCodes = {
        'Chennai': 'TN-01',
        'Coimbatore': 'TN-38',
        'Madurai': 'TN-59',
        'Trichy': 'TN-45',
        'Salem': 'TN-30',
        'Bengaluru': 'KA-03',
        'Mumbai': 'MH-02',
        'Delhi': 'DL-03'
      };
      const prefix = stateCodes[city] || 'TN-01';

      for (let i = 1; i <= 50; i++) {
        const template = carsPool[i % carsPool.length];
        const serial = String(i).padStart(3, '0');
        const plateNumber = `${prefix}-BR-${serial}${i}`;

        // Make the first vehicle in the city 'Rented' to simulate ongoing bookings
        const status = i === 1 ? 'Rented' : 'Available';

        const carObj = {
          name: `${template.name} (${i})`,
          brand: template.brand,
          model: template.model,
          year: 2022 + (i % 2),
          category: template.category,
          transmission: template.transmission,
          fuelType: template.fuelType,
          seats: template.seats,
          dailyPrice: template.dailyPrice,
          image: template.image,
          plateNumber,
          status,
          city,
          features: template.features,
          rules: template.rules
        };

        const vehicle = await Vehicle.create(carObj);
        seededVehicles.push(vehicle);
      }
    }

    console.log(`Successfully generated and seeded ${seededVehicles.length} vehicles.`);

    // Seed bookings history
    console.log('Seeding booking transactions history...');
    
    // Pick first vehicle (rented) in Chennai
    const chennaiRentedCar = seededVehicles.find(v => v.city === 'Chennai' && v.status === 'Rented');
    // Pick another vehicle in Coimbatore
    const coimbatoreRentedCar = seededVehicles.find(v => v.city === 'Coimbatore' && v.status === 'Rented');

    // Create Active rental in Chennai
    const b1Pickup = new Date();
    b1Pickup.setDate(b1Pickup.getDate() - 2);
    const b1Return = new Date();
    b1Return.setDate(b1Return.getDate() + 5);

    const booking1 = await Booking.create({
      customer: customer._id,
      vehicle: chennaiRentedCar._id,
      pickupDate: b1Pickup,
      returnDate: b1Return,
      totalDays: 7,
      totalAmount: 24965,
      securityDeposit: 5000,
      status: 'Ongoing',
      tollRoute: 'Mumbai to Pune (Expressway)', // Can use default simulated routes
      tollEstimatedAmount: 320,
      prepayTolls: true,
      carbonOffset: true,
      tollPaidAmount: 320,
      tollLogs: [
        { plazaName: 'Khalapur Toll Plaza', charge: 240, timestamp: b1Pickup },
        { plazaName: 'Urse Toll Plaza', charge: 80, timestamp: new Date() }
      ]
    });

    const p1 = await Payment.create({
      booking: booking1._id,
      amount: 24965,
      status: 'Success',
      transactionId: 'TXN-SEED-BHARATH-001',
      method: 'Card',
      createdAt: b1Pickup
    });

    booking1.payment = p1._id;
    await booking1.save();

    // Create a Future rental in Coimbatore
    const b2Pickup = new Date();
    b2Pickup.setDate(b2Pickup.getDate() + 4);
    const b2Return = new Date();
    b2Return.setDate(b2Return.getDate() + 7);

    const booking2 = await Booking.create({
      customer: customer._id,
      vehicle: coimbatoreRentedCar._id,
      pickupDate: b2Pickup,
      returnDate: b2Return,
      totalDays: 3,
      totalAmount: 18500,
      securityDeposit: 5000,
      status: 'Confirmed'
    });

    const p2 = await Payment.create({
      booking: booking2._id,
      amount: 18500,
      status: 'Success',
      transactionId: 'TXN-SEED-BHARATH-002',
      method: 'Card',
      createdAt: new Date()
    });

    booking2.payment = p2._id;
    await booking2.save();

    console.log('Bookings history seeded.');
    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
