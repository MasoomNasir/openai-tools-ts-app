import express from 'express';
import { chatWithStockMaster, chatWithThirtyNorth } from '../controllers/openaiController';
const router = express.Router();

router.post('/stock-master', chatWithStockMaster);
router.post('/thirtynorth', chatWithThirtyNorth);

export default router;
