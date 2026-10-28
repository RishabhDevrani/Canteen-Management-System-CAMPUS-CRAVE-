import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
  getFoods,
  getFoodsByCategory,
  createFood,
  updateFood,
  deleteFood,
  updateFoodAvailability,
} from '../controllers/menuController.js';
import { protect, adminOnly, staffOrKitchenOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/foods', getFoods);
router.get('/foods/category/:categoryId', getFoodsByCategory);

// Admin / Staff routes
router.post('/categories', protect, adminOnly, createCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

router.post('/foods', protect, adminOnly, createFood);
router.put('/foods/:id', protect, adminOnly, updateFood);
router.patch('/foods/:id', protect, adminOnly, updateFood);
router.delete('/foods/:id', protect, adminOnly, deleteFood);
router.patch('/foods/:id/availability', protect, staffOrKitchenOnly, updateFoodAvailability);

export default router;
