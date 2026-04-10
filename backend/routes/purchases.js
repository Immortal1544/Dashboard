import express from 'express';
import { createPurchase, deletePurchase, listPurchases, updatePurchase } from '../controllers/purchaseController.js';

const router = express.Router();

router.post('/', createPurchase);
router.get('/', listPurchases);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

export default router;
