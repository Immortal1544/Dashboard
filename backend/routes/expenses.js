import express from 'express';
import { createExpense, deleteExpense, listExpenses, updateExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', createExpense);
router.get('/', listExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
