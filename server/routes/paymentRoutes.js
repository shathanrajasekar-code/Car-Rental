const express = require('express');
const router = express.Router();
const { processCheckout } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkout', protect, authorize('customer'), processCheckout);

module.exports = router;
