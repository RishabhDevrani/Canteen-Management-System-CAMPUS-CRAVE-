import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  applyCoupon,
} from '../controllers/orderController.js';
import { protect, staffOrKitchenOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/apply-coupon', protect, applyCoupon);
router.get('/myorders', protect, getMyOrders);

// Staff / Kitchen / Admin routes
router.get('/', protect, staffOrKitchenOnly, getAllOrders);
router.patch('/:id/status', protect, staffOrKitchenOnly, updateOrderStatus);

export default router;
