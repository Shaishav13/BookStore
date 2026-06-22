import express from 'express';
import {
  getAllEBooks, getEBookById,
  createEBookPaymentIntent, purchaseEBook, purchaseEBookUpi,
  getUserEBooks, checkOwnership, seedEBooks,
} from '../controller/ebook.controller.js';

const router = express.Router();

router.get('/', getAllEBooks);
router.get('/seed', seedEBooks);
router.get('/user/:userId', getUserEBooks);
router.get('/owns/:userId/:ebookId', checkOwnership);
router.get('/:id', getEBookById);
router.post('/payment-intent', createEBookPaymentIntent);
router.post('/purchase', purchaseEBook);
router.post('/purchase-upi', purchaseEBookUpi);

export default router;
