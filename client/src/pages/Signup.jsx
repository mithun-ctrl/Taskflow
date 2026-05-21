import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-[22rem]">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-zinc-900 dark:text-white text-[2rem] font-black tracking-tight">
            TaskFlow
          </h1>
          <p className="text-zinc-400 dark:text-zinc-600 text-sm mt-1.5">
            Create your workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 transition-colors duration-200">
          <h2 className="text-zinc-900 dark:text-white text-lg font-semibold mb-6">Create account</h2>

          {error && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm px-4 py-3 rounded-lg mb-5 transition-colors duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Name"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="mb-4">
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="mb-4">
              <label className="text-zinc-500 text-xs font-medium block mb-1.5">
                Password <span className="text-zinc-300 dark:text-zinc-700 text-[0.6875rem]">min. 6 chars</span>
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 pr-11 rounded-lg outline-none transition-colors duration-150 font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-zinc-400 dark:text-zinc-600 flex p-0 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-150"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="signup-btn"
              type="submit"
              disabled={loading}
              className="mt-3 w-full flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-150 font-sans hover:bg-zinc-700 dark:hover:bg-zinc-200 active:bg-zinc-600 dark:active:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-400 dark:text-zinc-600 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-900 dark:text-white font-medium no-underline hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
