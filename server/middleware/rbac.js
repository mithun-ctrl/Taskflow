import pool from '../db/pool.js';

export function requireRole(...roles) {
  return async (req, res, next) => {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    const { rows } = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (!rows.length) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    if (!roles.includes(rows[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.memberRole = rows[0].role;
    next();
  };
}

export async function attachTaskProjectRole(req, res, next) {
  const { id: taskId } = req.params;
  const userId = req.user.id;

  const { rows: taskRows } = await pool.query(
    'SELECT project_id FROM tasks WHERE id = $1',
    [taskId]
  );

  if (!taskRows.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const projectId = taskRows[0].project_id;
  req.taskProjectId = projectId;

  const { rows } = await pool.query(
    'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (!rows.length) {
    return res.status(403).json({ error: 'Not a member of this project' });
  }

  req.memberRole = rows[0].role;
  next();
}
