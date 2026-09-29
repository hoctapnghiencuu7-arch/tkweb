import { Router, Request, Response } from 'express';
import { store } from '../../database/store.js';

const router = Router();

// GET /api/audit - List audit logs
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.auditLogs,
  });
});

export const auditRoutes = router;
