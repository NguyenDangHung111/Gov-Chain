import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';

const router = Router();

router.post('/login', authCtrl.login); // POST /api/auth/login

export default router;
