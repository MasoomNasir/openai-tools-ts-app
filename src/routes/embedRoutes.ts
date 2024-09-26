import express from 'express';
import { createEmbed, searchEmbed } from '../controllers/embedController';
const router = express.Router();

router.post('/create', createEmbed);
router.post('/search', searchEmbed);



export default router;
