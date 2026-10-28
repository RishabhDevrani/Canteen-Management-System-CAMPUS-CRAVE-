import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { generateOTP } from '../utils/generateOTP.js';
import { sendOTP } from '../utils/email.js';

// Schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Helper for JWT
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Invalid previous OTPs
    await prisma.otpVerification.deleteMany({
      where: { userId: user.id, type: 'REGISTER' },
    });

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt,
        type: 'REGISTER',
      },
    });

    await sendOTP(email, otp);

    res.status(201).json({ message: 'Registration successful. OTP sent to email.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { userId: user.id, type: 'REGISTER' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return res.status(400).json({ error: 'OTP not requested' });
    if (otpRecord.attempts >= 3) return res.status(400).json({ error: 'Too many attempts. Request new OTP.' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ error: 'OTP expired' });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Success
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(403).json({ error: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate login OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { userId: user.id, type: 'LOGIN' },
    });

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt,
        type: 'LOGIN',
      },
    });

    await sendOTP(email, otp);

    res.status(200).json({ message: 'Login OTP sent to email', requiresOtp: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { userId: user.id, type: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return res.status(400).json({ error: 'OTP not requested' });
    if (otpRecord.attempts >= 3) return res.status(400).json({ error: 'Too many attempts. Login again.' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ error: 'OTP expired' });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(['REGISTER', 'LOGIN', 'RESET']).default('LOGIN'),
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration, but with clear message
      return res.status(200).json({ message: 'If this email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { userId: user.id, type: 'RESET' },
    });

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt,
        type: 'RESET',
      },
    });

    await sendOTP(email, otp, 'Password Reset Code');

    res.status(200).json({ message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { userId: user.id, type: 'RESET' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return res.status(400).json({ error: 'No password reset OTP requested' });
    if (otpRecord.attempts >= 3) return res.status(400).json({ error: 'Too many attempts. Request a new OTP.' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ error: 'OTP has expired' });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    res.status(200).json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error resetting password' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email, type } = resendOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Rate limiting / cooldown check: if an OTP was created less than 45 seconds ago
    const lastOtp = await prisma.otpVerification.findFirst({
      where: { userId: user.id, type },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const timeSinceLastOtp = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;
      if (timeSinceLastOtp < 45) {
        return res.status(429).json({
          error: `Please wait ${Math.ceil(45 - timeSinceLastOtp)} seconds before requesting a new OTP.`,
        });
      }
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { userId: user.id, type },
    });

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        otp: hashedOtp,
        expiresAt,
        type,
      },
    });

    const purposeMap = {
      REGISTER: 'Account Verification Code',
      LOGIN: 'Login Verification Code',
      RESET: 'Password Reset Code',
    };

    await sendOTP(email, otp, purposeMap[type] || 'Verification Code');

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error resending OTP' });
  }
};
