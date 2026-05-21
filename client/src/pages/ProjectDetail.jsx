import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import { Plus, Trash2, Pencil, Users, ArrowLeft, ChevronDown, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const priorityColor = {
  high: 'bg-zinc-900 dark:bg-white',
  medium: 'bg-zinc-400 dark:bg-zinc-500',
  low: 'bg-zinc-200 dark:bg-zinc-700',
};

function TaskCard({ task, isAdmin, isAssignee, onEdit, onDelete, onStatusChange }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const dropRef = useRef(null);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const canChangeStatus = isAdmin || isAssignee;

  useEffect(() => {
    const handleClick = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all duration-150 hover:border-zinc-300 dark:hover:border-zinc-600">
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-zinc-900 dark:text-white text-sm font-medium leading-snug flex-1">{task.title}</p>
        {isAdmin && (
          <div className="flex gap-0.5 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="bg-transparent border-none cursor-pointer text-zinc-300 dark:text-zinc-700 p-1 rounded flex hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="bg-transparent border-none cursor-pointer text-zinc-300 dark:text-zinc-700 p-1 rounded flex hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-zinc-400 dark:text-zinc-700 text-xs mb-2.5 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority + overdue */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor[task.priority]}`} />
        <span className="text-zinc-500 dark:text-zinc-500 text-[0.6875rem] capitalize">{task.priority}</span>
        {isOverdue && (
          <span className="flex items-center gap-0.5 text-amber-600 dark:text-zinc-500 text-[0.6875rem]">
            <AlertTriangle size={9} /> overdue
          </span>
        )}
      </div>

      {/* Due date */}
      {task.due_date && (
        <p className={`text-[0.6875rem] mb-2.5 ${isOverdue ? 'text-amber-600 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-700'}`}>
          Due {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      {/* Assignee + status dropdown */}
      <div className="flex items-center justify-between">
        <div className="text-[0.6875rem] text-zinc-400 dark:text-zinc-700">
          {task.assignee_name ? (
            <span className="flex items-center gap-1.5">
              <span className="w-[1.125rem] h-[1.125rem] rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[0.5rem] text-zinc-500 font-bold">
                {task.assignee_name[0].toUpperCase()}
              </span>
              {task.assignee_name}
            </span>
          ) : (
            <span className="text-zinc-300 dark:text-zinc-800">Unassigned</span>
          )}
        </div>

        {canChangeStatus && (
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-zinc-400 dark:text-zinc-600 p-1 hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
            >
              <ChevronDown size={12} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 bottom-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden z-10 min-w-28 shadow-lg dark:shadow-none transition-colors duration-200">
                {COLUMNS.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => { onStatusChange(task.id, col.key); setStatusOpen(false); }}
                    className={`block w-full text-left px-3 py-2 text-xs bg-transparent border-none cursor-pointer transition-colors duration-100 ${
                      task.status === col.key
                        ? 'text-zinc-900 dark:text-white font-semibold'
                        : 'text-zinc-500 font-normal'
                    } hover:bg-zinc-100 dark:hover:bg-zinc-800`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [myRole, setMyRole] = useState('member');
  const isAdmin = myRole === 'admin';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/tasks`),
          api.get(`/projects/${id}/members`),
        ]);
        setProject(pRes.data);
        setMyRole(pRes.data.viewer_role);
        setTasks(tRes.data);
        setMembers(mRes.data);
      } catch {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const handleSaveTask = (saved, isEdit) => {
    const assignee = members.find((m) => m.id === saved.assignee_id);
    const enrichedTask = { ...saved, assignee_name: assignee ? assignee.name : null };
    setTasks((prev) => isEdit ? prev.map((t) => t.id === enrichedTask.id ? enrichedTask : t) : [enrichedTask, ...prev]);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStatusChange = async (taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    setTasks((prev) => prev.map((t) => t.id === data.id ? { ...t, status: data.status } : t));
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-zinc-400 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/projects" className="text-zinc-400 dark:text-zinc-600 flex no-underline hover:text-zinc-900 dark:hover:text-white transition-colors duration-150">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{project?.name}</h2>
          {project?.description && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 truncate">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to={`/projects/${id}/members`}
            className="flex items-center gap-2 px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 text-sm no-underline transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
          >
            <Users size={14} />
            Members ({members.length})
          </Link>
          {isAdmin && (
            <>
              <button
                id="add-task-btn"
                onClick={() => setTaskModal({ mode: 'create' })}
                className="flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200"
              >
                <Plus size={14} /> Add Task
              </button>
              <button
                onClick={handleDeleteProject}
                className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-600 p-2 cursor-pointer flex transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-zinc-500 dark:text-zinc-500 text-[0.6875rem] font-semibold uppercase tracking-wide">
                {col.label}
              </span>
              <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-px text-zinc-400 dark:text-zinc-700 text-xs font-bold transition-colors duration-200">
                {grouped[col.key].length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {grouped[col.key].length === 0 && (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-300 dark:text-zinc-800 text-xs">No tasks</p>
                </div>
              )}
              {grouped[col.key].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  isAssignee={task.assignee_id === user?.id}
                  onEdit={(t) => setTaskModal({ mode: 'edit', task: t })}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {taskModal && (
        <TaskModal
          projectId={id}
          members={members}
          task={taskModal.mode === 'edit' ? taskModal.task : null}
          onClose={() => setTaskModal(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
