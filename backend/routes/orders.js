import express from 'express';
import { createOrder, deleteOrder, listOrders, updateOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
