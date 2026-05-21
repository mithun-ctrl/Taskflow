import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, FolderKanban, X, ArrowRight } from 'lucide-react';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreate(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-zinc-900 dark:text-white text-base font-semibold">New Project</h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white flex p-1 transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm px-4 py-3 rounded-lg mb-5 transition-colors duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">Project name</label>
            <input
              id="project-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>
          <div className="mb-6">
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">
              Description <span className="text-zinc-300 dark:text-zinc-700">(optional)</span>
            </label>
            <textarea
              id="project-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 bg-transparent text-zinc-500 text-sm font-medium px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-all duration-150 font-sans hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              id="create-project-btn"
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = (project) => setProjects((prev) => [{ ...project, task_count: 0, role: 'admin' }, ...prev]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-zinc-400 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">Projects</h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {!projects.length ? (
        <div className="text-center py-24">
          <FolderKanban size={32} className="text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-400 dark:text-zinc-600 text-sm">No projects yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="no-underline block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors duration-200">
                  <FolderKanban size={15} className="text-zinc-400 dark:text-zinc-600" />
                </div>
                <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                  project.role === 'admin'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                }`}>
                  {project.role}
                </span>
              </div>
              <h3 className="text-zinc-900 dark:text-white font-semibold text-[0.9375rem] mb-1.5 truncate">
                {project.name}
              </h3>
              <p className="text-zinc-400 dark:text-zinc-700 text-[0.8125rem] mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 dark:text-zinc-700 text-xs">{project.task_count} task{project.task_count !== '1' ? 's' : ''}</span>
                <ArrowRight size={13} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors duration-150" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
