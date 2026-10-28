import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, isEmailVerified: true },
      });

      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

export const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as staff' });
  }
};

export const kitchenOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'KITCHEN' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized for kitchen access' });
  }
};

export const staffOrKitchenOnly = (req, res, next) => {
  if (req.user && ['STAFF', 'KITCHEN', 'ADMIN'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized for orders access' });
  }
};
