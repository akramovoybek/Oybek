import { NavLink, Outlet } from 'react-router-dom';
import { FileText, Trophy, Tag } from 'lucide-react';

const links = [
  { to: '/admin/problems', label: 'Problems', icon: FileText },
  { to: '/admin/contests', label: 'Contests', icon: Trophy },
  { to: '/admin/topics', label: 'Topics', icon: Tag },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your platform content</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <l.icon className="w-4 h-4" />
            {l.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
