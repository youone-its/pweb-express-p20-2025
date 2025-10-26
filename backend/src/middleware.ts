import { Request, Response, NextFunction, Express } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  return app;
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Token tidak ada', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(new AppError('Token invalid', 401));
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  if (err.name === 'ZodError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
};

export const startServer = (app: Express, port: number | string = process.env.PORT || 3000) => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};