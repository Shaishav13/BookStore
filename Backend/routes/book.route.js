import express from 'express'
import { getBook, getBookById, createBook, createMultipleBooks, getRelatedBooks, getCategories } from '../controller/book.controller.js';
const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getBook);
router.get("/:id", getBookById);
router.get("/:bookId/related", getRelatedBooks);
router.post("/", createBook);
router.post("/bulk", createMultipleBooks);

export default router;
