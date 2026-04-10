import express from 'express';
import { login, register, updateAccount } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update', requireAuth, updateAccount);

export default router;
