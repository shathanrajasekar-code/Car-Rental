const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueChart,
  exportBookingsCSV,
  getCustomers,
  toggleBlockCustomer
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/revenue-chart', protect, authorize('admin'), getRevenueChart);
router.get('/export-csv', protect, authorize('admin'), exportBookingsCSV);
router.get('/customers', protect, authorize('admin'), getCustomers);
router.put('/customers/:id/block', protect, authorize('admin'), toggleBlockCustomer);

module.exports = router;
