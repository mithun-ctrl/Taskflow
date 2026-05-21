import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
