import express from 'express';
import { chatWithTools } from '../controllers/openaiController';
const router = express.Router();

router.post('/chat', chatWithTools);

export default router;
