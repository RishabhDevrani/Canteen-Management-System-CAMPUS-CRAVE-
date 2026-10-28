import { prisma } from '../utils/prisma.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

const foodSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.number(),
  isVeg: z.boolean().default(true),
  availability: z.boolean().default(true),
  prepTime: z.number().positive(),
  image: z.string().url().optional(),
});

// CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { foods: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Server error' });
  }
};

// FOODS
export const getFoods = async (req, res) => {
  try {
    const foods = await prisma.food.findMany({
      include: { category: true },
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFoodsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const foods = await prisma.food.findMany({
      where: { categoryId: Number(categoryId) },
      include: { category: true },
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createFood = async (req, res) => {
  try {
    const data = foodSchema.parse(req.body);
    const food = await prisma.food.create({ data });
    res.status(201).json(food);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateFoodAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    const food = await prisma.food.update({
      where: { id: Number(id) },
      data: { availability: Boolean(availability) },
    });
    res.json(food);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating availability' });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const foodId = Number(id);
    const data = foodSchema.partial().parse(req.body);

    const food = await prisma.food.update({
      where: { id: foodId },
      data,
      include: { category: true },
    });
    res.json(food);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error updating food' });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const foodId = Number(id);

    // Check if food was ordered before
    const orderItemsCount = await prisma.orderItem.count({
      where: { foodId },
    });

    if (orderItemsCount > 0) {
      // Archive / disable to protect order history foreign key
      await prisma.food.update({
        where: { id: foodId },
        data: { availability: false },
      });
      return res.json({
        message: 'Food has order history. It has been deactivated/hidden from customer menu.',
        archived: true,
      });
    }

    // Delete reviews if any
    await prisma.review.deleteMany({
      where: { foodId },
    });

    await prisma.food.delete({
      where: { id: foodId },
    });

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting food' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = Number(id);

    const foodCount = await prisma.food.count({
      where: { categoryId },
    });

    if (foodCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category containing ${foodCount} food item(s). Reassign or remove foods first.`,
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting category' });
  }
};
