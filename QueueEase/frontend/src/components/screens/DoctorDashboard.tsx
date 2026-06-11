/**
 * QueueEase V2 — Doctor/Admin Dashboard
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertTriangle, CheckCircle, Pause, Play, X, Activity, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQueueStore } from '../../stores/queueStore';
import { Button, GlassCard, StatCard, Badge, Modal, TokenDisplay } from '../ui';
import type { Queue, QueueEntry } from '../../types';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { queue, fetchTodayQueue, callNext, completeConsultation, togglePause, closeQueue } = useQueueStore();
  
  const [showCallNext, setShowCallNext] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');

  useEffect(() => {
    // Auto-load today's queue for the doctor's first clinic
    if (user?.clinicIds?.[0]) {
      fetchTodayQueue(user.clinicIds[0]);
    }
  }, [user]);

  const handleCallNext = async () => {
    if (!queue) return;
    try {
      await callNext();
      setShowCallNext(false);
    } catch (error) {
      console.error('Failed to call next:', error);
    }
  };

  const handleComplete = async () => {
    const currentPatient = queue?.entries?.find((e: any) => e.status === 'in-consultation');
    if (!currentPatient) return;
    try {
      await completeConsultation(currentPatient._id, consultationNotes);
      setShowComplete(false);
      setConsultationNotes('');
    } catch (error) {
      console.error('Failed to complete consultation:', error);
    }
  };

  const handleTogglePause = async () => {
    try {
      await togglePause();
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  };

  const handleCloseQueue = async () => {
    try {
      await closeQueue();
    } catch (error) {
      console.error('Failed to close queue:', error);
    }
  };

  const waitingPatients = queue?.entries?.filter((e: any) => e.status === 'waiting') || [];
  const currentPatient = queue?.entries?.find((e: any) => e.status === 'in-consultation');
  const completedToday = queue?.stats?.completed || 0;
  const emergencyCount = queue?.stats?.emergencies || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
          <p className="text-white/50 mt-1">Dr. {user?.name} • {user?.specialization || 'General Practice'}</p>
        </div>
        <div className="flex items-center gap-3">
          {queue && (
            <>
              <Button
                variant={queue.status === 'paused' ? 'primary' : 'secondary'}
                leftIcon={queue.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                onClick={handleTogglePause}
              >
                {queue.status === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="danger"
                leftIcon={<X className="w-4 h-4" />}
                onClick={handleCloseQueue}
              >
                Close Queue
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Waiting"
          value={waitingPatients.length}
          icon={<Users className="w-5 h-5" />}
          variant="teal"
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Emergencies"
          value={emergencyCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={emergencyCount > 0 ? 'emergency' : 'default'}
        />
        <StatCard
          title="Avg. Wait"
          value={`${queue?.stats?.averageWaitMinutes || 0}m`}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Current Patient / Call Next */}
      {currentPatient ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <GlassCard variant="neon" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant="in-consultation">Currently Consulting</Badge>
                <h2 className="text-xl font-bold text-white mt-2">{currentPatient.patientName}</h2>
                <p className="text-white/50">Token: {currentPatient.tokenNumber}</p>
              </div>
              <TokenDisplay
                token={currentPatient.tokenNumber}
                priority={currentPatient.priority}
                size="sm"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => setShowComplete(true)}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                className="flex-1"
              >
                Complete Consultation
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <GlassCard padding="lg">
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-white/70 mb-2">No patient currently consulting</h3>
            <p className="text-white/40 mb-4">Call the next patient to begin</p>
            <Button
              variant="primary"
              onClick={handleCallNext}
              disabled={waitingPatients.length === 0}
              leftIcon={<Users className="w-5 h-5" />}
              size="lg"
            >
              Call Next Patient ({waitingPatients.length} waiting)
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Waiting Queue */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title mb-4">Waiting Queue</h2>
        {waitingPatients.length > 0 ? (
          <div className="space-y-2">
            {waitingPatients.map((entry: any, index: number) => (
              <GlassCard key={entry._id} hover padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-teal text-sm">
                      {entry.position}
                    </div>
                    <div>
                      <p className="font-medium text-white">{entry.patientName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">{entry.tokenNumber}</span>
                        <Badge variant={entry.priority} pulse={entry.priority === 'emergency'}>
                          {entry.priority}
                        </Badge>
                        <Badge variant="info">{entry.appointmentType}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-teal">~{entry.estimatedWaitMinutes}m</p>
                    <p className="text-xs text-white/40">
                      {new Date(entry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard padding="md">
            <div className="text-center py-8 text-white/40">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No patients waiting</p>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* Complete Consultation Modal */}
      <Modal isOpen={showComplete} onClose={() => setShowComplete(false)} title="Complete Consultation">
        <div className="space-y-4">
          <textarea
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
            placeholder="Add consultation notes (optional)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-teal/50 min-h-[120px] resize-none"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowComplete(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleComplete} className="flex-1">
              Complete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
