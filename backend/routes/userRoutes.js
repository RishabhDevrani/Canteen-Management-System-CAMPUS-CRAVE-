import express from 'express';
import { getAllUsers, updateUserRole } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/role', protect, adminOnly, updateUserRole);

export default router;
