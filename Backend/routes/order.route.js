import express from 'express'
import { createOrder, createUpiOrder, createPaymentIntent, generateReceipt, viewOrder } from '../controller/order.controller.js';

const router=express.Router()
router.post("/create",createOrder)
router.post("/create-upi",createUpiOrder)
router.post("/payment-intents",createPaymentIntent)
router.get("/view/:userId",viewOrder)
router.get("/receipt/:orderId",generateReceipt)
export default router;
