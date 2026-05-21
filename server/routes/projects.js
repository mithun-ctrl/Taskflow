import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projects.js';
import { listMembers, addMember, updateMemberRole, removeMember } from '../controllers/members.js';
import { listTasks, createTask } from '../controllers/tasks.js';

const router = Router();

router.use(authenticate);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', requireRole('admin'), updateProject);
router.delete('/:id', deleteProject);

router.get('/:id/members', requireRole('admin', 'member'), listMembers);
router.post('/:id/members', requireRole('admin'), addMember);
router.put('/:id/members/:userId', requireRole('admin'), updateMemberRole);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);

router.get('/:id/tasks', requireRole('admin', 'member'), listTasks);
router.post('/:id/tasks', requireRole('admin'), createTask);

export default router;
