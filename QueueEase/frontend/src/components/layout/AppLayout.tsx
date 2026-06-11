/**
 * QueueEase V2 — Main App Layout
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Home, Calendar, BarChart3, Bell, Settings, User,
  Stethoscope, LogOut, Menu, X, ChevronRight, MessageSquare
} from 'lucide-react';

const PATIENT_NAV = [
  { path: '/patient/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/patient/queue', icon: Stethoscope, label: 'Queue' },
  { path: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const DOCTOR_NAV = [
  { path: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/doctor/queue', icon: Stethoscope, label: 'Queue' },
  { path: '/doctor/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const RECEPTIONIST_NAV = [
  { path: '/receptionist/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/receptionist/queue', icon: Stethoscope, label: 'Queue' },
  { path: '/receptionist/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'doctor' ? DOCTOR_NAV 
    : user?.role === 'receptionist' ? RECEPTIONIST_NAV 
    : PATIENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-navy-500">
      {/* ─── Sidebar ───────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300
        bg-gradient-navy border-r border-white/10
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal/20">
            <Stethoscope className="w-6 h-6 text-teal" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">QueueEase</h1>
            <p className="text-xs text-white/40">Smart Queue Management</p>
          </div>
          <button
            onClick={toggleSidebar}
            className="ml-auto lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                <User className="w-5 h-5 text-teal" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-teal capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (sidebarOpen) toggleSidebar();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive
                    ? 'bg-teal/15 text-teal border border-teal/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-emergency hover:bg-emergency/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Overlay ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ─── Main Content ─────────────────────────── */}
      <main className="flex-1 min-h-screen lg:ml-0">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-navy-500/90 backdrop-blur-lg border-b border-white/10 lg:hidden">
          <button onClick={toggleSidebar} className="text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal" />
            <span className="font-bold text-white">QueueEase</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
