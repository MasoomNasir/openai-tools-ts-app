import express from 'express';
import { chatWithStockMaster } from '../controllers/openaiController';
const router = express.Router();

router.post('/stock-master', chatWithStockMaster);

export default router;
