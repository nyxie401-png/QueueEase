/**
 * QueueEase V2 — Patient Dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bell, Plus, Search, MapPin, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQueueStore } from '../../stores/queueStore';
import { Button, GlassCard, StatCard, TokenDisplay, Badge, EmptyState } from '../ui';
import type { Clinic, Appointment } from '../../types';

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { myEntry, fetchTodayQueue } = useQueueStore();
  const navigate = useNavigate();
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Load clinics and appointments from API
      // For now, use mock data
      setClinics([]);
      setAppointments([]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/50 mt-1">Here's your queue status today</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />} onClick={() => navigate('/patient/appointments')}>
          Book Appointment
        </Button>
      </motion.div>

      {/* Active Queue Token */}
      {myEntry ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard variant="neon" padding="lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="in-consultation">In Queue</Badge>
                  <Badge variant={myEntry.priority}>{myEntry.priority}</Badge>
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Your Queue Status</h2>
                <p className="text-white/50 text-sm">
                  Joined at {new Date(myEntry.joinedAt).toLocaleTimeString()}
                </p>
              </div>
              <TokenDisplay
                token={myEntry.tokenNumber}
                position={myEntry.position}
                estimatedWait={myEntry.estimatedWaitMinutes}
                priority={myEntry.priority}
                size="lg"
              />
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <GlassCard padding="lg">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-lg font-semibold text-white/70 mb-2">Not in Queue</h3>
              <p className="text-sm text-white/40 mb-4">Join a queue or book an appointment</p>
              <Button variant="primary" onClick={() => navigate('/patient/queue')}>
                Find a Clinic
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointments"
          value={appointments.filter((a: any) => a.status === 'scheduled').length}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="Completed Visits"
          value={appointments.filter((a: any) => a.status === 'completed').length}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Notifications"
          value="3"
          icon={<Bell className="w-5 h-5" />}
        />
        <StatCard
          title="Saved Clinics"
          value="0"
          icon={<Star className="w-5 h-5" />}
        />
      </div>

      {/* Nearby Clinics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Nearby Clinics</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/queue')}>
            View All
          </Button>
        </div>
        
        {clinics.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {clinics.map((clinic) => (
              <GlassCard key={clinic._id} hover padding="md">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{clinic.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                      <MapPin className="w-3 h-3" />
                      {clinic.address.city}, {clinic.address.district}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-teal">
                    <Star className="w-3 h-3 fill-current" />
                    {clinic.rating.average.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="info">{clinic.specialty || 'General Practice'}</Badge>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/patient/queue/${clinic._id}`)}>
                    Join Queue
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard padding="md">
            <EmptyState
              title="No clinics found nearby"
              description="Search for clinics in your area to join their queue"
              action={
                <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
                  Search Clinics
                </Button>
              }
            />
          </GlassCard>
        )}
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Upcoming Appointments</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>
            View All
          </Button>
        </div>
        
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((apt) => (
              <GlassCard key={apt._id} hover padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{apt.type}</h3>
                    <p className="text-sm text-white/50 mt-1">
                      {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot.start}
                    </p>
                  </div>
                  <Badge variant={apt.status === 'confirmed' ? 'completed' : 'waiting'}>
                    {apt.status}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard padding="md">
            <EmptyState
              title="No upcoming appointments"
              description="Book an appointment to see a doctor"
              action={
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Book Appointment
                </Button>
              }
            />
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}