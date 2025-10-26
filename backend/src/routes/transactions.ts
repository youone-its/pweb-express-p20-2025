import { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../db";
import { AppError, AuthRequest, authMiddleware } from "../middleware";

export const setupTransactionRoutes = (app: Express) => {
  console.log("Setting up transaction routes...");

  app.post(
    "/transactions",
    authMiddleware,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { items } = z
          .object({
            items: z
              .array(
                z.object({
                  book_id: z
                    .string()
                    .or(z.number())
                    .transform((val) =>
                      typeof val === "string" ? parseInt(val) : val
                    ),
                  quantity: z.number().int().min(1, "Quantity minimal 1"),
                })
              )
              .min(1, "Minimal 1 item dalam order"),
          })
          .parse(req.body);

        const userId = parseInt(req.userId!);

        const bookDetails = [];
        for (const item of items) {
          const book = await db.books.findFirst({
            where: { id: item.book_id, deleted_at: null },
            include: { genre: true },
          });

          if (!book) {
            throw new AppError(
              `Buku dengan ID ${item.book_id} tidak ditemukan`,
              404
            );
          }

          if (book.stock_quantity < item.quantity) {
            throw new AppError(
              `Stok buku "${book.title}" tidak mencukupi. Stok tersedia: ${book.stock_quantity}`,
              400
            );
          }

          bookDetails.push({ book, quantity: item.quantity });
        }

        const order = await db.orders.create({
          data: {
            user_id: userId,
            order_items: {
              create: bookDetails.map((detail) => ({
                book_id: detail.book.id,
                quantity: detail.quantity,
              })),
            },
          },
          include: {
            order_items: {
              include: {
                book: {
                  include: {
                    genre: true,
                  },
                },
              },
            },
          },
        });

        for (const detail of bookDetails) {
          await db.books.update({
            where: { id: detail.book.id },
            data: {
              stock_quantity: detail.book.stock_quantity - detail.quantity,
            },
          });
        }

        const total = order.order_items.reduce(
          (sum, item) => sum + Number(item.book.price) * item.quantity,
          0
        );

        res.status(201).json({
          success: true,
          message: "Transaksi berhasil dibuat",
          data: { ...order, total },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/transactions",
    authMiddleware,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = parseInt(req.userId!);

        const orders = await db.orders.findMany({
          where: { user_id: userId },
          include: {
            order_items: {
              include: {
                book: {
                  include: {
                    genre: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: "desc" },
        });

        const ordersWithTotal = orders.map((order) => {
          const total = order.order_items.reduce(
            (sum, item) => sum + Number(item.book.price) * item.quantity,
            0
          );
          return { ...order, total };
        });

        res.json({
          success: true,
          data: ordersWithTotal,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  console.log("Registering /transactions/statistics route");
  app.get(
    "/transactions/statistics",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("Statistics endpoint HIT!");
        console.log("Statistics request received");

        const orders = await db.orders.findMany({
          include: {
            order_items: {
              include: {
                book: {
                  include: {
                    genre: true,
                  },
                },
              },
            },
          },
        });

        if (orders.length === 0) {
          return res.json({
            success: true,
            data: {
              totalTransactions: 0,
              avgTransaction: 0,
              mostPopularGenre: null,
              leastPopularGenre: null,
            },
          });
        }

        const totalTransactions = orders.length;

        const totalAmount = orders.reduce((sum, order) => {
          const orderTotal = order.order_items.reduce(
            (itemSum, item) =>
              itemSum + Number(item.book.price) * item.quantity,
            0
          );
          return sum + orderTotal;
        }, 0);
        const avgTransaction = totalAmount / totalTransactions;

        const genreCounts: { [key: string]: number } = {};

        orders.forEach((order) => {
          order.order_items.forEach((item) => {
            const genreName = item.book.genre.name;
            genreCounts[genreName] =
              (genreCounts[genreName] || 0) + item.quantity;
          });
        });

        const sortedGenres = Object.entries(genreCounts).sort(
          (a, b) => b[1] - a[1]
        );

        const mostPopularGenre =
          sortedGenres.length > 0 ? sortedGenres[0][0] : null;
        const leastPopularGenre =
          sortedGenres.length > 0
            ? sortedGenres[sortedGenres.length - 1][0]
            : null;

        console.log("Statistics calculated successfully");

        res.json({
          success: true,
          data: {
            totalTransactions,
            avgTransaction: parseFloat(avgTransaction.toFixed(2)),
            mostPopularGenre,
            leastPopularGenre,
            genreBreakdown: Object.fromEntries(sortedGenres),
          },
        });
      } catch (error) {
        console.error("Statistics error:", error);
        next(error);
      }
    }
  );

  console.log("Registering /transactions/:transaction_id route");
  app.get(
    "/transactions/:transaction_id",
    authMiddleware,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        console.log(
          "Transaction detail endpoint HIT with ID:",
          req.params.transaction_id
        );
        const transactionId = parseInt(req.params.transaction_id);
        if (isNaN(transactionId)) {
          throw new AppError("Transaction ID tidak valid", 400);
        }

        const userId = parseInt(req.userId!);

        const order = await db.orders.findFirst({
          where: {
            id: transactionId,
            user_id: userId,
          },
          include: {
            order_items: {
              include: {
                book: {
                  include: {
                    genre: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        });

        if (!order) {
          throw new AppError("Transaksi tidak ditemukan", 404);
        }

        const total = order.order_items.reduce(
          (sum, item) => sum + Number(item.book.price) * item.quantity,
          0
        );

        res.json({
          success: true,
          data: { ...order, total },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  console.log("Transaction routes setup complete");
};
