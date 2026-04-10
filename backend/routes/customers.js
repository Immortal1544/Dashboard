import express from 'express';
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.post('/', createCustomer);
router.get('/', listCustomers);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
