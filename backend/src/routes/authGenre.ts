import { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { AppError, AuthRequest, authMiddleware } from "../middleware";

// ============ AUTH ROUTES ============
export const setupAuthRoutes = (app: Express) => {
  // POST /auth/register
  app.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username } = z.object({
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        username: z.string().optional()
      }).parse(req.body);

      const existingUser = await db.users.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError("Email sudah terdaftar", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.users.create({
        data: {
          email,
          password: hashedPassword,
          username: username || null
        },
        select: {
          id: true,
          email: true,
          username: true,
          created_at: true
        }
      });

      res.status(201).json({
        success: true,
        message: "User berhasil didaftarkan",
        data: user
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /auth/login
  app.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = z.object({
        email: z.string().email("Email tidak valid"),
        password: z.string().min(1, "Password tidak boleh kosong")
      }).parse(req.body);

      const user = await db.users.findUnique({ where: { email } });
      if (!user) {
        throw new AppError("Email atau password salah", 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError("Email atau password salah", 401);
      }

      const token = jwt.sign(
        { userId: user.id.toString() },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Login berhasil",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /auth/me
  app.get("/auth/me", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await db.users.findUnique({
        where: { id: parseInt(req.userId!) },
        select: {
          id: true,
          email: true,
          username: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        throw new AppError("User tidak ditemukan", 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  });
};

// ============ GENRE ROUTES ============
export const setupGenreRoutes = (app: Express) => {
  // POST /genre
  app.post("/genre", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = z.object({
        name: z.string().min(1, "Nama genre tidak boleh kosong")
      }).parse(req.body);

      const existingGenre = await db.genres.findFirst({
        where: { name, deleted_at: null }
      });
      if (existingGenre) {
        throw new AppError("Genre dengan nama ini sudah ada", 400);
      }

      const genre = await db.genres.create({
        data: { name }
      });

      res.status(201).json({
        success: true,
        message: "Genre berhasil dibuat",
        data: genre
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /genre
  app.get("/genre", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genres = await db.genres.findMany({
        where: { deleted_at: null },
        include: {
          _count: {
            select: { books: true }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      res.json({
        success: true,
        data: genres
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /genre/:genre_id
  app.get("/genre/:genre_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genreId = parseInt(req.params.genre_id);
      if (isNaN(genreId)) {
        throw new AppError("Genre ID tidak valid", 400);
      }

      const genre = await db.genres.findFirst({
        where: { id: genreId, deleted_at: null },
        include: {
          _count: {
            select: { books: true }
          }
        }
      });

      if (!genre) {
        throw new AppError("Genre tidak ditemukan", 404);
      }

      res.json({
        success: true,
        data: genre
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /genre/:genre_id
  app.patch("/genre/:genre_id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genreId = parseInt(req.params.genre_id);
      if (isNaN(genreId)) {
        throw new AppError("Genre ID tidak valid", 400);
      }

      const { name } = z.object({
        name: z.string().min(1, "Nama genre tidak boleh kosong")
      }).parse(req.body);

      const existingGenre = await db.genres.findFirst({
        where: { id: genreId, deleted_at: null }
      });
      if (!existingGenre) {
        throw new AppError("Genre tidak ditemukan", 404);
      }

      const duplicateGenre = await db.genres.findFirst({
        where: {
          name,
          id: { not: genreId },
          deleted_at: null
        }
      });
      if (duplicateGenre) {
        throw new AppError("Genre dengan nama ini sudah ada", 400);
      }

      const updatedGenre = await db.genres.update({
        where: { id: genreId },
        data: { name }
      });

      res.json({
        success: true,
        message: "Genre berhasil diupdate",
        data: updatedGenre
      });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /genre/:genre_id
  app.delete("/genre/:genre_id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genreId = parseInt(req.params.genre_id);
      if (isNaN(genreId)) {
        throw new AppError("Genre ID tidak valid", 400);
      }

      const genre = await db.genres.findFirst({
        where: { id: genreId, deleted_at: null }
      });

      if (!genre) {
        throw new AppError("Genre tidak ditemukan", 404);
      }

      await db.genres.update({
        where: { id: genreId },
        data: { deleted_at: new Date() }
      });

      res.json({
        success: true,
        message: "Genre berhasil dihapus"
      });
    } catch (error) {
      next(error);
    }
  });
};

// ============ BOOK ROUTES ============
export const setupBookRoutes = (app: Express) => {
  // POST /books
  app.post("/books", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = z.object({
        title: z.string().min(1, "Judul tidak boleh kosong"),
        writer: z.string().min(1, "Penulis tidak boleh kosong"),
        publisher: z.string().min(1, "Penerbit tidak boleh kosong"),
        publication_year: z.number().int().min(1000).max(2025, "Tahun publikasi maksimal 2025"),
        description: z.string().optional(),
        price: z.number().positive("Harga harus positif"),
        stock_quantity: z.number().int().min(0, "Stok tidak boleh negatif"),
        genre_id: z.string().or(z.number())
      }).parse(req.body);

      const genreId = typeof genre_id === 'string' ? parseInt(genre_id) : genre_id;

      const existingBook = await db.books.findFirst({
        where: { title, deleted_at: null }
      });
      if (existingBook) {
        throw new AppError("Buku dengan judul ini sudah ada", 400);
      }

      const genre = await db.genres.findFirst({
        where: { id: genreId, deleted_at: null }
      });
      if (!genre) {
        throw new AppError("Genre tidak ditemukan", 404);
      }

      const book = await db.books.create({
        data: {
          title,
          writer,
          publisher,
          publication_year,
          description: description || null,
          price,
          stock_quantity,
          genre_id: genreId
        },
        include: {
          genre: true
        }
      });

      res.status(201).json({
        success: true,
        message: "Buku berhasil dibuat",
        data: book
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /books
  app.get("/books", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'created_at';
      const skip = (page - 1) * limit;

      const where: any = { deleted_at: null };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { writer: { contains: search, mode: 'insensitive' } }
        ];
      }

      let orderBy: any = { created_at: 'desc' };
      if (sortBy === 'title') {
        orderBy = { title: 'asc' };
      } else if (sortBy === 'publication_year') {
        orderBy = { publication_year: 'desc' };
      } else if (sortBy === 'price') {
        orderBy = { price: 'asc' };
      }

      const [books, total] = await Promise.all([
        db.books.findMany({
          where,
          include: { genre: true },
          skip,
          take: limit,
          orderBy
        }),
        db.books.count({ where })
      ]);

      res.json({
        success: true,
        data: books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /books/genre/:genre_id
  app.get("/books/genre/:genre_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genreId = parseInt(req.params.genre_id);
      if (isNaN(genreId)) {
        throw new AppError("Genre ID tidak valid", 400);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'created_at';
      const skip = (page - 1) * limit;

      const genre = await db.genres.findFirst({
        where: { id: genreId, deleted_at: null }
      });
      if (!genre) {
        throw new AppError("Genre tidak ditemukan", 404);
      }

      const where: any = { genre_id: genreId, deleted_at: null };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { writer: { contains: search, mode: 'insensitive' } }
        ];
      }

      let orderBy: any = { created_at: 'desc' };
      if (sortBy === 'title') {
        orderBy = { title: 'asc' };
      } else if (sortBy === 'publication_year') {
        orderBy = { publication_year: 'desc' };
      } else if (sortBy === 'price') {
        orderBy = { price: 'asc' };
      }

      const [books, total] = await Promise.all([
        db.books.findMany({
          where,
          include: { genre: true },
          skip,
          take: limit,
          orderBy
        }),
        db.books.count({ where })
      ]);

      res.json({
        success: true,
        data: books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /books/:book_id
  app.get("/books/:book_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = parseInt(req.params.book_id);
      if (isNaN(bookId)) {
        throw new AppError("Book ID tidak valid", 400);
      }

      const book = await db.books.findFirst({
        where: { id: bookId, deleted_at: null },
        include: { genre: true }
      });

      if (!book) {
        throw new AppError("Buku tidak ditemukan", 404);
      }

      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /books/:book_id
  app.patch("/books/:book_id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = parseInt(req.params.book_id);
      if (isNaN(bookId)) {
        throw new AppError("Book ID tidak valid", 400);
      }

      const updateSchema = z.object({
        title: z.string().min(1).optional(),
        writer: z.string().min(1).optional(),
        publisher: z.string().min(1).optional(),
        publication_year: z.number().int().min(1000).max(2025).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        stock_quantity: z.number().int().min(0).optional(),
        genre_id: z.string().or(z.number()).optional()
      });

      const data = updateSchema.parse(req.body);

      const existingBook = await db.books.findFirst({
        where: { id: bookId, deleted_at: null }
      });
      if (!existingBook) {
        throw new AppError("Buku tidak ditemukan", 404);
      }

      if (data.title && data.title !== existingBook.title) {
        const duplicateBook = await db.books.findFirst({
          where: { title: data.title, deleted_at: null, id: { not: bookId } }
        });
        if (duplicateBook) {
          throw new AppError("Buku dengan judul ini sudah ada", 400);
        }
      }

      if (data.genre_id) {
        const genreId = typeof data.genre_id === 'string' ? parseInt(data.genre_id) : data.genre_id;
        const genre = await db.genres.findFirst({
          where: { id: genreId, deleted_at: null }
        });
        if (!genre) {
          throw new AppError("Genre tidak ditemukan", 404);
        }
        (data as any).genre_id = genreId;
      }

      const updatedBook = await db.books.update({
        where: { id: bookId },
        data: data as any,
        include: { genre: true }
      });

      res.json({
        success: true,
        message: "Buku berhasil diupdate",
        data: updatedBook
      });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /books/:book_id
  app.delete("/books/:book_id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = parseInt(req.params.book_id);
      if (isNaN(bookId)) {
        throw new AppError("Book ID tidak valid", 400);
      }

      const book = await db.books.findFirst({
        where: { id: bookId, deleted_at: null }
      });

      if (!book) {
        throw new AppError("Buku tidak ditemukan", 404);
      }

      await db.books.update({
        where: { id: bookId },
        data: { deleted_at: new Date() }
      });

      res.json({
        success: true,
        message: "Buku berhasil dihapus"
      });
    } catch (error) {
      next(error);
    }
  });
};
