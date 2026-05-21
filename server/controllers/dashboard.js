import pool from '../db/pool.js';

export async function getDashboard(req, res) {
  const userId = req.user.id;

  const { rows: projects } = await pool.query(
    `SELECT COUNT(*) AS total_projects
     FROM project_members WHERE user_id = $1`,
    [userId]
  );

  const { rows: taskStats } = await pool.query(
    `SELECT 
       COUNT(*) FILTER (WHERE t.status = 'todo') AS todo,
       COUNT(*) FILTER (WHERE t.status = 'in_progress') AS in_progress,
       COUNT(*) FILTER (WHERE t.status = 'done') AS done,
       COUNT(*) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'done') AS overdue,
       COUNT(*) AS total
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = $1`,
    [userId]
  );

  const { rows: myTasks } = await pool.query(
    `SELECT 
       COUNT(*) FILTER (WHERE status = 'todo') AS todo,
       COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
       COUNT(*) FILTER (WHERE status = 'done') AS done,
       COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'done') AS overdue
     FROM tasks WHERE assignee_id = $1`,
    [userId]
  );

  const { rows: recentTasks } = await pool.query(
    `SELECT t.id, t.title, t.status, t.priority, t.due_date,
            p.name AS project_name, u.name AS assignee_name
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = $1
     LEFT JOIN users u ON u.id = t.assignee_id
     ORDER BY t.created_at DESC
     LIMIT 10`,
    [userId]
  );

  const { rows: overdueTasks } = await pool.query(
    `SELECT t.id, t.title, t.status, t.priority, t.due_date,
            p.name AS project_name
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = $1
     WHERE t.due_date < CURRENT_DATE AND t.status != 'done'
     ORDER BY t.due_date ASC
     LIMIT 5`,
    [userId]
  );

  res.json({
    projects: { total: parseInt(projects[0].total_projects) },
    tasks: taskStats[0],
    myTasks: myTasks[0],
    recentTasks,
    overdueTasks,
  });
}
