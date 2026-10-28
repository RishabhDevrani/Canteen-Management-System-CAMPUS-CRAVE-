import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const orderItemSchema = z.object({
  foodId: z.number(),
  quantity: z.number().positive(),
});

const createOrderSchema = z.object({
  tableId: z.number().optional(),
  couponCode: z.string().optional(),
  couponId: z.number().optional(),
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI']),
});

export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== 'number') {
      return res.status(400).json({ error: 'Coupon code and subtotal are required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);

    res.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discount,
      finalAmount: subtotal - discount,
      message: `Coupon applied: ₹${discount} off!`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error applying coupon' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user.id;

    // Fetch all foods in the order to calculate total
    const foodIds = data.items.map(item => item.foodId);
    const foods = await prisma.food.findMany({
      where: { id: { in: foodIds } },
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({ error: 'Some food items are invalid or unavailable' });
    }

    let totalAmount = 0;
    const orderItemsData = data.items.map(item => {
      const food = foods.find(f => f.id === item.foodId);
      totalAmount += food.price * item.quantity;
      return {
        foodId: item.foodId,
        quantity: item.quantity,
        priceAtTime: food.price,
      };
    });

    let discount = 0;
    let couponId = data.couponId || null;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });
      if (coupon && new Date() <= coupon.expiryDate && totalAmount >= coupon.minOrderValue) {
        couponId = coupon.id;
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((totalAmount * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, totalAmount);
      }
    }

    const finalAmount = Math.max(0, totalAmount - discount);

    const order = await prisma.order.create({
      data: {
        userId,
        tableId: data.tableId,
        couponId: data.couponId,
        totalAmount,
        discount,
        finalAmount,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: data.paymentMethod,
            status: 'PENDING',
          },
        },
      },
      include: {
        items: { include: { food: true } },
        payment: true,
      },
    });

    // Notify kitchen via Socket.IO (will be accessed via req.app.get('io') or similar)
    req.app.get('io').emit('new_order', order);

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { food: true } }, payment: true, table: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { food: true } }, payment: true, user: { select: { name: true, email: true } }, table: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        user: { select: { id: true, name: true } },
        payment: true,
        items: { include: { food: true } },
      },
    });

    if (status === 'COMPLETED' && order.payment && order.payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { status: 'SUCCESS' },
      });
    }

    // Real-time update to the specific customer
    req.app.get('io').to(`user_${order.userId}`).emit('order_status_update', order);
    
    // Broadcast to kitchen/staff/admin
    req.app.get('io').emit('order_status_changed', order);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
