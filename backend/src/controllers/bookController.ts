import { Request, Response, NextFunction } from "express"
import { db } from "../db"
import { z } from "zod"

export const createBook = async (req: Request, res: Response, next: NextFunction) => {}
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {}
export const getBooksByGenre = async (req: Request, res: Response, next: NextFunction) => {}
export const getBookDetail = async (req: Request, res: Response, next: NextFunction) => {}
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {}
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {}
