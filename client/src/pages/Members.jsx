import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, Trash2, ChevronDown } from 'lucide-react';

function RoleDropdown({ member, onRoleChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500 cursor-pointer transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
        >
          {member.role}
          <ChevronDown size={11} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden z-10 min-w-24 shadow-lg dark:shadow-none transition-colors duration-200">
            {['admin', 'member'].map((r) => (
              <button
                key={r}
                onClick={() => { onRoleChange(member.id, r); setOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-xs bg-transparent border-none cursor-pointer transition-colors duration-100 ${
                  member.role === r ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 font-normal'
                } hover:bg-zinc-100 dark:hover:bg-zinc-800`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(member.id)}
        className="bg-transparent border-none cursor-pointer text-zinc-300 dark:text-zinc-700 p-1.5 rounded-md flex transition-colors duration-150 hover:text-zinc-900 dark:hover:text-white"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function Members() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState('member');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const isAdmin = myRole === 'admin';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/members`),
        ]);
        setProject(pRes.data);
        setMyRole(pRes.data.viewer_role);
        setMembers(mRes.data);
      } catch {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      const { data } = await api.post(`/projects/${id}/members`, { email: inviteEmail, role: inviteRole });
      setMembers((prev) => [...prev, data]);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    await api.put(`/projects/${id}/members/${userId}`, { role });
    setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role } : m));
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-zinc-400 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/projects/${id}`}
          className="text-zinc-400 dark:text-zinc-600 flex no-underline hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Members</h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">{project?.name}</p>
        </div>
      </div>

      {/* Invite form */}
      {isAdmin && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-6 transition-colors duration-200">
          <p className="text-zinc-900 dark:text-white text-[0.9375rem] font-semibold mb-5">Invite member</p>

          {inviteError && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm px-4 py-3 rounded-lg mb-5 transition-colors duration-200">
              {inviteError}
            </div>
          )}

          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
            />
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-auto shrink-0 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans cursor-pointer focus:border-zinc-400 dark:focus:border-zinc-600"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              id="invite-btn"
              type="submit"
              disabled={inviteLoading}
              className="shrink-0 flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={14} /> Invite
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <p className="text-[0.6875rem] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        {members.map((member, i) => (
          <div
            key={member.id}
            className={`flex items-center gap-4 px-6 py-4 ${i !== members.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-900/50' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 transition-colors duration-200">
              <span className="text-zinc-500 text-xs font-bold">
                {member.name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-white text-[0.9375rem] font-medium truncate">{member.name}</p>
              <p className="text-zinc-400 dark:text-zinc-700 text-xs truncate">{member.email}</p>
            </div>
            {isAdmin ? (
              <RoleDropdown member={member} onRoleChange={handleRoleChange} onRemove={handleRemove} />
            ) : (
              <span className="text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md transition-colors duration-200">
                {member.role}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
