import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function TaskModal({ projectId, members, task, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee_id: task?.assignee_id || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null };
      let res;
      if (isEdit) {
        res = await api.put(`/tasks/${task.id}`, payload);
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, payload);
      }
      onSave(res.data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/88 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-lg transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-zinc-900 dark:text-white text-base font-semibold">{isEdit ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white flex p-1 transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm px-4 py-3 rounded-lg mb-5 transition-colors duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">Task title</label>
            <input
              id="task-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Design landing page"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">
              Description <span className="text-zinc-300 dark:text-zinc-700 text-[0.6875rem] ml-1">&#40;optional&#41;</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Add details..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Status</label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans cursor-pointer focus:border-zinc-400 dark:focus:border-zinc-600"
              >
                {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Priority</label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans cursor-pointer focus:border-zinc-400 dark:focus:border-zinc-600"
              >
                {priorities.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Assignee</label>
              <select
                id="task-assignee"
                value={form.assignee_id}
                onChange={(e) => set('assignee_id', e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans cursor-pointer focus:border-zinc-400 dark:focus:border-zinc-600"
              >
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Due date</label>
              <input
                id="task-due-date"
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans focus:border-zinc-400 dark:focus:border-zinc-600 scheme-light dark:scheme-dark"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 bg-transparent text-zinc-500 text-sm font-medium px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-all duration-150 font-sans hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200 active:bg-zinc-600 dark:active:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
