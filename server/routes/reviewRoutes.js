const express = require('express');
const router = express.Router();
const { addReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), addReview);

module.exports = router;
