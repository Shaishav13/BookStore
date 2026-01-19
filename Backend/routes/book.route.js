import express from 'express'
import { getBook, createBook, createMultipleBooks } from '../controller/book.controller.js';
const router=express.Router();

router.get("/",getBook);
router.post("/", createBook);
router.post("/bulk", createMultipleBooks);

export default router;
