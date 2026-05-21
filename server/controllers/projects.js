import pool from '../db/pool.js';

export async function listProjects(req, res) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, pm.role,
            u.name AS owner_name,
            (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
     JOIN users u ON u.id = p.owner_id
     ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

export async function createProject(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description || null, req.user.id]
    );
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [rows[0].id, req.user.id, 'admin']
    );
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getProject(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT p.*, u.name AS owner_name,
            pm.role AS viewer_role
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
     WHERE p.id = $1`,
    [id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json(rows[0]);
}

export async function updateProject(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const { rows } = await pool.query(
    'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name.trim(), description || null, id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json(rows[0]);
}

export async function deleteProject(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT owner_id FROM projects WHERE id = $1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  if (rows[0].owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner can delete this project' });
  }
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  res.json({ message: 'Project deleted' });
}
