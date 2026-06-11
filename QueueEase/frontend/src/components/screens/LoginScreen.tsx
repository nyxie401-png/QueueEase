/**
 * QueueEase V2 — Login / Register Screen
 * Supports three roles: Patient, Doctor, Receptionist
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, User, Stethoscope, ClipboardList, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input, GlassCard } from '../ui';

type AuthMode = 'login' | 'register';
type Role = 'patient' | 'doctor' | 'receptionist';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    specialization: '', medicalLicenseNo: '', employeeId: '', clinicId: '',
  });
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role,
          specialization: role === 'doctor' ? formData.specialization : undefined,
          medicalLicenseNo: role === 'doctor' ? formData.medicalLicenseNo : undefined,
          clinicId: role === 'receptionist' ? formData.clinicId : undefined,
          employeeId: role === 'receptionist' ? formData.employeeId : undefined,
        });
      }
      
      // Navigate based on role
      const user = useAuthStore.getState().user;
      const dashboardMap: Record<string, string> = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
      };
      navigate(dashboardMap[user?.role || 'patient'] || '/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const roleCards: { role: Role; icon: React.ReactNode; title: string; desc: string }[] = [
    { role: 'patient', icon: <User className="w-6 h-6" />, title: 'Patient', desc: 'Join queues & book appointments' },
    { role: 'doctor', icon: <Stethoscope className="w-6 h-6" />, title: 'Doctor', desc: 'Manage your clinic queue' },
    { role: 'receptionist', icon: <ClipboardList className="w-6 h-6" />, title: 'Receptionist', desc: 'Handle patient check-ins' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal/20 mb-4">
            <Stethoscope className="w-8 h-8 text-teal" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Queue</span>
            <span className="neon-text">Ease</span>
          </h1>
          <p className="text-white/50 mt-2">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <GlassCard variant="light" padding="lg">
          {/* Mode toggle */}
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === 'login' ? 'bg-teal text-navy-500' : 'text-white/50 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === 'register' ? 'bg-teal text-navy-500' : 'text-white/50 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Role selector (register mode) */}
          {mode === 'register' && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {roleCards.map((rc) => (
                <button
                  key={rc.role}
                  onClick={() => setRole(rc.role)}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    role === rc.role
                      ? 'border-teal/50 bg-teal/10 text-teal'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                  }`}
                >
                  {rc.icon}
                  <span className="text-xs font-medium mt-1">{rc.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {mode === 'register' && (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+94 XX XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            )}

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            )}

            {/* Doctor-specific fields */}
            {mode === 'register' && role === 'doctor' && (
              <>
                <Input
                  label="Specialization"
                  placeholder="e.g., General Practice, Cardiology"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
                <Input
                  label="Medical License Number"
                  placeholder="SLMC Registration No."
                  value={formData.medicalLicenseNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalLicenseNo: e.target.value }))}
                />
              </>
            )}

            {/* Receptionist-specific fields */}
            {mode === 'register' && role === 'receptionist' && (
              <>
                <Input
                  label="Clinic ID"
                  placeholder="Enter clinic ID"
                  value={formData.clinicId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinicId: e.target.value }))}
                />
                <Input
                  label="Employee ID"
                  placeholder="Your employee ID"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {mode === 'login' ? 'Sign In' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>
          </form>

          {/* Firebase auth placeholder */}
          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4 text-xs text-white/30">or continue with</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" className="text-xs">
                📱 Phone
              </Button>
              <Button variant="secondary" size="sm" className="text-xs">
                🔥 Firebase
              </Button>
            </div>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-white/30 mt-6">
          By continuing, you agree to QueueEase Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
