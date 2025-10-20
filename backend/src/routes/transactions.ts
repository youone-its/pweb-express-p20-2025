import { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AppError, AuthRequest, authMiddleware } from '../middleware';

export const setupTransactionRoutes = (app: Express) => {
  app.post('/transactions', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { items } = z.object({
        items: z.array(
          z.object({
            book_id: z.string().min(1, 'Book ID tidak boleh kosong'),
            quantity: z.number().min(1, 'Quantity minimal 1')
          })
        ).min(1, 'Minimal 1 item dalam order')
      }).parse(req.body);

      const bookDetails = [];
      for (const item of items) {}

      const order = await db.orders.create({});

      for (const item of items) {}

      const total = order.order_items.reduce();

      res.status(201).json({
        success: true,
        data: { ...order, total }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/transactions', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await db.orders.findMany({});

      const ordersWithTotal = orders.map((order: any) => ({}));

      res.json({ success: true, data: ordersWithTotal });
    } catch (error) {
      next(error);
    }
  });

  app.get('/transactions/:transaction_id',authMiddleware,async (req: AuthRequest, res: Response, next: NextFunction) => {}
  );

  app.get('/transactions/statistics',authMiddleware,async (req: Request, res: Response, next: NextFunction) => {
      try {
        const orders = await db.orders.findMany({});

        if (orders.length === 0) {}

        const totalTransactions = orders.length;

        const totalAmount = orders.reduce((sum: number, order: any) =>);
        const avgTransaction = totalAmount / totalTransactions;

        const genreCounts: { [key: string]: number } = {};
        orders.forEach((order: any) => {});

        const sorted = Object.entries(genreCounts).sort();

        const mostPopular = sorted[0]?.[0] || null;
        const leastPopular = sorted[sorted.length - 1]?.[0] || null;

        res.json({
          success: true,
          data: {
            totalTransactions,
            avgTransaction: parseFloat(avgTransaction.toFixed(2)),
            mostPopularGenre: mostPopular,
            leastPopularGenre: leastPopular,
            genreBreakdown: Object.fromEntries(sorted)
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );
};