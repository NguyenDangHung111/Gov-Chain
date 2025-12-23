import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/case.controller';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/', upload.single('file'), ctrl.submitCase);                 // POST /api/cases
router.get('/all', ctrl.getAllCases);              // GET /api/cases/all
router.put('/:caseId/status', ctrl.updateStatus);  // PUT /api/cases/:caseId/status
router.get('/:caseId', ctrl.getCase);              // GET /api/cases/:caseId
router.get('/:caseId/logs', ctrl.getLogs);         // GET /api/cases/:caseId/logs

export default router;
