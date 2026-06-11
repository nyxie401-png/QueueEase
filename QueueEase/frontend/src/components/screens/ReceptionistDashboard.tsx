/**
 * QueueEase V2 — Receptionist Dashboard
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertTriangle, Plus, UserPlus, PhoneCall, CheckCircle, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQueueStore } from '../../stores/queueStore';
import { Button, GlassCard, StatCard, Badge, Modal, Input, TokenDisplay } from '../ui';
import type { QueueEntry } from '../../types';

export default function ReceptionistDashboard() {
  const { user } = useAuthStore();
  const { queue, fetchTodayQueue, joinQueue, addEmergency, callNext, cancelEntry } = useQueueStore();
  
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' });
  const [emergencyData, setEmergencyData] = useState({ name: '', phone: '', reason: '' });

  useEffect(() => {
    if (user?.employedClinicId) {
      fetchTodayQueue(user.employedClinicId);
    }
  }, [user]);

  const waitingPatients = queue?.entries?.filter((e: any) => e.status === 'waiting') || [];
  const filteredPatients = searchQuery
    ? waitingPatients.filter((p: any) =>
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : waitingPatients;

  const handleAddWalkIn = async () => {
    try {
      await joinQueue({
        priority: 'normal',
        appointmentType: 'walk-in',
        patientName: newPatient.name,
        patientPhone: newPatient.phone,
      });
      setShowAddPatient(false);
      setNewPatient({ name: '', phone: '' });
    } catch (error) {
      console.error('Failed to add walk-in:', error);
    }
  };

  const handleAddEmergency = async () => {
    try {
      await addEmergency({
        patientName: emergencyData.name,
        patientPhone: emergencyData.phone,
        reason: emergencyData.reason,
        severity: 'critical',
      });
      setShowEmergency(false);
      setEmergencyData({ name: '', phone: '', reason: '' });
    } catch (error) {
      console.error('Failed to add emergency:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Reception Desk</h1>
          <p className="text-white/50 mt-1">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setShowAddPatient(true)}
          >
            Add Walk-In
          </Button>
          <Button
            variant="emergency"
            leftIcon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => setShowEmergency(true)}
          >
            Emergency
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Today"
          value={queue?.stats?.totalPatients || 0}
          icon={<Users className="w-5 h-5" />}
          variant="teal"
        />
        <StatCard
          title="Waiting Now"
          value={waitingPatients.length}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Completed"
          value={queue?.stats?.completed || 0}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Emergencies"
          value={queue?.stats?.emergencies || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={queue?.stats?.emergencies ? 'emergency' : 'default'}
        />
      </div>

      {/* Queue Management */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-teal/50 min-h-[48px]"
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<PhoneCall className="w-4 h-4" />}
          onClick={async () => {
            await callNext();
          }}
          disabled={waitingPatients.length === 0}
        >
          Call Next
        </Button>
      </div>

      {/* Patient List */}
      {filteredPatients.length > 0 ? (
        <div className="space-y-2">
          {filteredPatients.map((entry: any) => (
            <GlassCard key={entry._id} hover padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.priority === 'emergency' ? 'bg-emergency/20 text-emergency' :
                    entry.priority === 'urgent' ? 'bg-urgent/20 text-urgent' :
                    'bg-white/10 text-teal'
                  }`}>
                    {entry.position}
                  </div>
                  <div>
                    <p className="font-medium text-white">{entry.patientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40 font-mono">{entry.tokenNumber}</span>
                      <Badge variant={entry.priority} pulse={entry.priority === 'emergency'}>
                        {entry.priority}
                      </Badge>
                      <span className="text-xs text-white/30">{entry.appointmentType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-teal">~{entry.estimatedWaitMinutes}m</p>
                    <p className="text-xs text-white/40">
                      {new Date(entry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {entry.priority !== 'emergency' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await cancelEntry(entry._id);
                      }}
                      className="text-white/30 hover:text-emergency"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard padding="md">
          <div className="text-center py-8 text-white/40">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>{searchQuery ? 'No matching patients' : 'No patients waiting'}</p>
          </div>
        </GlassCard>
      )}

      {/* Add Walk-In Modal */}
      <Modal isOpen={showAddPatient} onClose={() => setShowAddPatient(false)} title="Add Walk-In Patient">
        <div className="space-y-4">
          <Input
            label="Patient Name"
            placeholder="Enter patient name"
            value={newPatient.name}
            onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Phone Number"
            placeholder="+94 XX XXX XXXX"
            value={newPatient.phone}
            onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddPatient(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddWalkIn} className="flex-1">
              Add to Queue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emergency Modal */}
      <Modal isOpen={showEmergency} onClose={() => setShowEmergency(false)} title="⚠️ Emergency Patient">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency text-sm">
            Emergency patients are given top priority in the queue.
          </div>
          <Input
            label="Patient Name"
            placeholder="Enter patient name"
            value={emergencyData.name}
            onChange={(e) => setEmergencyData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+94 XX XXX XXXX"
            value={emergencyData.phone}
            onChange={(e) => setEmergencyData(prev => ({ ...prev, phone: e.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">Emergency Reason</label>
            <textarea
              value={emergencyData.reason}
              onChange={(e) => setEmergencyData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Describe the emergency..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-teal/50 min-h-[100px] resize-none"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowEmergency(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="emergency" onClick={handleAddEmergency} className="flex-1">
              Add Emergency
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
