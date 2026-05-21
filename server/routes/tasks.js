import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { attachTaskProjectRole } from '../middleware/rbac.js';
import { updateTask, patchTaskStatus, deleteTask } from '../controllers/tasks.js';

const router = Router();

router.use(authenticate);
router.use('/:id', attachTaskProjectRole);

router.put('/:id', updateTask);
router.patch('/:id/status', patchTaskStatus);
router.delete('/:id', deleteTask);

export default router;
