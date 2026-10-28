import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const reviewSchema = z.object({
  foodId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const createReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = reviewSchema.parse(req.body);
    const userId = req.user.id;

    // Check if food exists
    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food item not found' });

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        foodId,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Update food's overall average rating
    const aggregations = await prisma.review.aggregate({
      where: { foodId },
      _avg: { rating: true },
    });

    const newAvg = parseFloat((aggregations._avg.rating || rating).toFixed(1));

    await prisma.food.update({
      where: { id: foodId },
      data: { rating: newAvg },
    });

    res.status(201).json({ review, newRating: newAvg });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error adding review' });
  }
};

export const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { foodId: Number(foodId) },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching reviews' });
  }
};
