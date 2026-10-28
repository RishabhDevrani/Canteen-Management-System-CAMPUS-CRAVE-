import express from 'express';
import {
  register,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  resendOtp,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-register', verifyRegisterOtp);
router.post('/login', login);
router.post('/verify-login', verifyLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);

export default router;
