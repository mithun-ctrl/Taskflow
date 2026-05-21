import pool from '../db/pool.js';

export async function listTasks(req, res) {
  const { id: projectId } = req.params;
  const { status, priority, assignee } = req.query;

  let query = `
    SELECT t.*, 
           u.name AS assignee_name, u.email AS assignee_email,
           c.name AS created_by_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assignee_id
    JOIN users c ON c.id = t.created_by
    WHERE t.project_id = $1
  `;
  const params = [projectId];

  if (status) {
    params.push(status);
    query += ` AND t.status = $${params.length}`;
  }
  if (priority) {
    params.push(priority);
    query += ` AND t.priority = $${params.length}`;
  }
  if (assignee) {
    params.push(assignee);
    query += ` AND t.assignee_id = $${params.length}`;
  }

  query += ' ORDER BY t.created_at DESC';

  const { rows } = await pool.query(query, params);
  res.json(rows);
}

export async function createTask(req, res) {
  const { id: projectId } = req.params;
  const { title, description, assignee_id, status, priority, due_date } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  if (assignee_id) {
    const member = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, assignee_id]
    );
    if (!member.rows.length) {
      return res.status(400).json({ error: 'Assignee must be a project member' });
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO tasks (project_id, title, description, assignee_id, created_by, status, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      projectId,
      title.trim(),
      description || null,
      assignee_id || null,
      req.user.id,
      status || 'todo',
      priority || 'medium',
      due_date || null,
    ]
  );
  res.status(201).json(rows[0]);
}

export async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, assignee_id, status, priority, due_date } = req.body;

  if (req.memberRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can fully edit tasks' });
  }

  if (!title) return res.status(400).json({ error: 'title is required' });

  const { rows } = await pool.query(
    `UPDATE tasks SET title = $1, description = $2, assignee_id = $3, status = $4,
                      priority = $5, due_date = $6
     WHERE id = $7 RETURNING *`,
    [
      title.trim(),
      description || null,
      assignee_id || null,
      status || 'todo',
      priority || 'medium',
      due_date || null,
      id,
    ]
  );
  if (!rows.length) return res.status(404).json({ error: 'Task not found' });
  res.json(rows[0]);
}

export async function patchTaskStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['todo', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'status must be todo, in_progress, or done' });
  }

  const { rows: taskRows } = await pool.query(
    'SELECT assignee_id FROM tasks WHERE id = $1',
    [id]
  );
  if (!taskRows.length) return res.status(404).json({ error: 'Task not found' });

  const isAdmin = req.memberRole === 'admin';
  const isAssignee = taskRows[0].assignee_id === req.user.id;

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ error: 'Only admin or assignee can update task status' });
  }

  const { rows } = await pool.query(
    'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  res.json(rows[0]);
}

export async function deleteTask(req, res) {
  const { id } = req.params;

  if (req.memberRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete tasks' });
  }

  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
}
