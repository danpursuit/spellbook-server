import express from 'express';
import { addView, getViews } from '../controllers/views.js';

const router = express.Router();

router.get('/viewCount', getViews);
router.get('/addView', addView);

export default router;