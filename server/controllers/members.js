import pool from '../db/pool.js';

export async function listMembers(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.joined_at ASC`,
    [id]
  );
  res.json(rows);
}

export async function addMember(req, res) {
  const { id: projectId } = req.params;
  const { email, role } = req.body;

  if (!email) return res.status(400).json({ error: 'email is required' });
  const validRoles = ['admin', 'member'];
  const assignedRole = validRoles.includes(role) ? role : 'member';

  const { rows: userRows } = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  if (!userRows.length) return res.status(404).json({ error: 'User not found' });

  const userId = userRows[0].id;

  const existing = await pool.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  if (existing.rows.length) {
    return res.status(409).json({ error: 'User is already a member' });
  }

  await pool.query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
    [projectId, userId, assignedRole]
  );

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
     FROM project_members pm JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 AND pm.user_id = $2`,
    [projectId, userId]
  );
  res.status(201).json(rows[0]);
}

export async function updateMemberRole(req, res) {
  const { id: projectId, userId } = req.params;
  const { role } = req.body;

  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'role must be admin or member' });
  }

  const { rows } = await pool.query(
    'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *',
    [role, projectId, userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Member not found' });
  res.json(rows[0]);
}

export async function removeMember(req, res) {
  const { id: projectId, userId } = req.params;

  const { rows: projectRows } = await pool.query(
    'SELECT owner_id FROM projects WHERE id = $1',
    [projectId]
  );
  if (projectRows[0]?.owner_id === userId) {
    return res.status(400).json({ error: 'Cannot remove the project owner' });
  }

  const { rowCount } = await pool.query(
    'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  if (!rowCount) return res.status(404).json({ error: 'Member not found' });
  res.json({ message: 'Member removed' });
}
