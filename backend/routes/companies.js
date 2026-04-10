import express from 'express';
import { createCompany, deleteCompany, listCompanies, updateCompany } from '../controllers/companyController.js';

const router = express.Router();

router.post('/', createCompany);
router.get('/', listCompanies);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
