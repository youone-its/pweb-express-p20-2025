import { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { AppError, AuthRequest, authMiddleware } from '../middleware';

export const setupAuthRoutes = (app: Express) => {
  app.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {});

  app.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {});
};

export const setupGenreRoutes = (app: Express) => {
  app.post('/genre', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/genre', async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/genre/:genre_id', async (req: Request, res: Response, next: NextFunction) => {});

  app.patch('/genre/:genre_id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});

  app.delete('/genre/:genre_id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});
};

export const setupBookRoutes = (app: Express) => {
  app.post('/books', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/books', async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/books/genre/:genre_id', async (req: Request, res: Response, next: NextFunction) => {});

  app.get('/books/:book_id', async (req: Request, res: Response, next: NextFunction) => {});

  app.patch('/books/:book_id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});

  app.delete('/books/:book_id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {});
};