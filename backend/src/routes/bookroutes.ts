import { Router } from "express"
import {
  createBook,
  getAllBooks,
  getBooksByGenre,
  getBookDetail,
  updateBook,
  deleteBook
} from "../controllers/bookController"
import { authMiddleware } from "../middleware"


const router = Router()

router.post("/", authMiddleware, createBook)
router.get("/", getAllBooks)
router.get("/genre/:genre_id", getBooksByGenre)
router.get("/:book_id", getBookDetail)
router.patch("/:book_id", authMiddleware, updateBook)
router.delete("/:book_id", authMiddleware, deleteBook)

export default router
