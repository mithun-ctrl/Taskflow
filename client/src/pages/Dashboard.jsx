import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Circle, ArrowRight } from 'lucide-react';

const statusBadgeClasses = {
  todo: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-600',
  in_progress: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700',
  done: 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600',
};
const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{label}</span>
        <Icon size={14} className="text-zinc-300 dark:text-zinc-700" />
      </div>
      <p className="text-[2.5rem] font-black text-zinc-900 dark:text-white leading-none">{value ?? '—'}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-zinc-400 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const t = data?.tasks || {};
  const mt = data?.myTasks || {};

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">Welcome, {user?.name?.split(' ')[0]}</h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">See your projects.</p>
      </div>

      {/* Overview */}
      <section className="mb-10">
        <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Overview</p>
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Projects" value={data?.projects?.total} icon={FolderKanban} />
          <StatCard label="Total Tasks" value={t.total} icon={Circle} />
          <StatCard label="In Progress" value={t.in_progress} icon={Clock} />
          <StatCard label="Overdue" value={t.overdue} icon={AlertTriangle} />
        </div>
      </section>

      {/* My Tasks */}
      <section className="mb-10">
        <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">My Tasks</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'To Do', val: mt.todo },
            { label: 'In Progress', val: mt.in_progress },
            { label: 'Done', val: mt.done },
          ].map(({ label, val }) => (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-200" key={label}>
              <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{label}</p>
              <p className="text-[2.5rem] font-black text-zinc-900 dark:text-white leading-none">{val ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent + Overdue */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Recent Tasks</p>
            <Link to="/projects" className="text-zinc-400 dark:text-zinc-600 text-xs no-underline flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors duration-150">
              All projects <ArrowRight size={11} />
            </Link>
          </div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors duration-200">
            {!data?.recentTasks?.length ? (
              <p className="text-zinc-300 dark:text-zinc-700 text-sm p-6">No tasks yet.</p>
            ) : (
              data.recentTasks.map((task, i) => (
                <div key={task.id} className={`flex items-center gap-3 px-5 py-3.5 ${i !== data.recentTasks.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-900' : ''}`}>
                  <CheckCircle2 size={13} className={`shrink-0 ${task.status === 'done' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-200 dark:text-zinc-800'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.8125rem] font-medium truncate ${task.status === 'done' ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    <p className="text-zinc-300 dark:text-zinc-700 text-[0.6875rem] mt-0.5">{task.project_name}</p>
                  </div>
                  <span className={`text-[0.625rem] font-semibold px-2 py-0.5 rounded-md ${statusBadgeClasses[task.status]}`}>
                    {statusLabel[task.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Overdue Tasks */}
        <section>
          <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Overdue Tasks</p>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors duration-200">
            {!data?.overdueTasks?.length ? (
              <p className="text-zinc-300 dark:text-zinc-700 text-sm p-6">No overdue tasks</p>
            ) : (
              data.overdueTasks.map((task, i) => (
                <div key={task.id} className={`flex items-center gap-3 px-5 py-3.5 ${i !== data.overdueTasks.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-900' : ''}`}>
                  <AlertTriangle size={13} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-900 dark:text-white text-[0.8125rem] font-medium truncate">{task.title}</p>
                    <p className="text-zinc-400 dark:text-zinc-600 text-[0.6875rem] mt-0.5">
                      {task.project_name} · Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[0.6875rem] font-semibold text-zinc-500 uppercase">{task.priority}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
