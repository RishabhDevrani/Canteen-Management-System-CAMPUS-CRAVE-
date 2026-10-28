import { prisma } from '../utils/prisma.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    const activeOrders = await prisma.order.count({
      where: { status: { in: ['CONFIRMED', 'PREPARING', 'READY'] } }
    });

    // Get popular food items
    const orderItems = await prisma.orderItem.groupBy({
      by: ['foodId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const popularFoodIds = orderItems.map(item => item.foodId);
    const popularFoodsData = await prisma.food.findMany({
      where: { id: { in: popularFoodIds } },
      select: { id: true, name: true, image: true }
    });

    const popularFoods = orderItems.map(item => {
      const food = popularFoodsData.find(f => f.id === item.foodId);
      return {
        ...food,
        totalSold: item._sum.quantity
      };
    });

    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeOrders,
      popularFoods
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
