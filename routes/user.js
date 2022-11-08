import express from 'express';
import { signin, changePassword, getRanking } from '../controllers/user.js'
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/changePassword', auth, changePassword);
router.post('/getRanking', getRanking);

export default router;