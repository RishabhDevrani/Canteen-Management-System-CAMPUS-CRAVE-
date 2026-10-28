import express from 'express';
import { createReview, getFoodReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/food/:foodId', getFoodReviews);

export default router;
