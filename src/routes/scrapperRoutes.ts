import express from 'express';
import { scrape } from '../controllers/scrapController';
const router = express.Router();

router.post('/', scrape);

export default router;

