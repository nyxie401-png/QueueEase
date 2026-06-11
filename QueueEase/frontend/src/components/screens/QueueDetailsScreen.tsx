import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Stethoscope,
  Phone,
  MessageSquare,
  Timer,
  Hash,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  SkipForward,
  Pause,
  Play,
  X,
  Send,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TokenDisplay } from '../ui/TokenDisplay';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { useQueueStore } from '../../stores/queueStore';
import { useSocket } from '../../hooks';

interface QueueEntryDetail {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    bloodType?: string;
    allergies?: string[];
  };
  tokenNumber: string;
  position: number;
  status: 'waiting' | 'in-consultation' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  appointmentType: 'walk-in' | 'appointment' | 'emergency';
  estimatedWaitMinutes?: number;
  joinedAt: string;
  startedAt?: string;
  completedAt?: string;
  emergencyReason?: string;
  notes?: string;
}

const QueueDetailsScreen: React.FC = () => {
  const { fetchTodayQueue, queue, isLoading, callNext, completeConsultation, cancelEntry, togglePause } = useQueueStore();
  const [selectedEntry, setSelectedEntry] = useState<QueueEntryDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useSocket({
    'queue-updated': () => fetchTodayQueue(),
    'your-turn': () => fetchTodayQueue(),
  });

  useEffect(() => {
    fetchTodayQueue();
  }, []);

  const queueData = queue as any;
  const entries: QueueEntryDetail[] = queueData?.entries || [];
  const queueStatus = queueData?.status || 'active';

  const waitingEntries = entries.filter((e) => e.status === 'waiting');
  const inConsultation = entries.filter((e) => e.status === 'in-consultation');
  const completedEntries = entries.filter((e) => e.status === 'completed');
  const cancelledEntries = entries.filter((e) => e.status === 'cancelled');

  const handleCallNext = async () => {
    setIsProcessing(true);
    try {
      await callNext();
      fetchTodayQueue();
    } catch (err) {
      console.error('Failed to call next:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedEntry) return;
    setIsProcessing(true);
    try {
      await completeConsultation(selectedEntry._id, consultationNotes);
      setShowCompleteModal(false);
      setConsultationNotes('');
      fetchTodayQueue();
    } catch (err) {
      console.error('Failed to complete consultation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedEntry) return;
    setIsProcessing(true);
    try {
      await cancelEntry(selectedEntry._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      fetchTodayQueue();
    } catch (err) {
      console.error('Failed to cancel entry:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePause = async () => {
    setIsProcessing(true);
    try {
      await togglePause();
      fetchTodayQueue();
    } catch (err) {
      console.error('Failed to toggle pause:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDuration = (start: string, end?: string): string => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diffMins = Math.floor((endTime - startTime) / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  const renderEntryCard = (entry: QueueEntryDetail, index: number) => (
    <motion.div
      key={entry._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border transition-all ${
        entry.priority === 'emergency'
          ? 'border-red-500/30 bg-red-500/5'
          : entry.priority === 'urgent'
          ? 'border-yellow-500/20 bg-yellow-500/5'
          : 'border-white/10 bg-white/[0.02]'
      } ${expandedEntry === entry._id ? 'ring-1 ring-teal-500/30' : ''}`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpandedEntry(expandedEntry === entry._id ? null : entry._id)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
            entry.priority === 'emergency' ? 'bg-red-500/20 text-red-400' :
            entry.status === 'in-consultation' ? 'bg-teal-500/20 text-teal-400' :
            entry.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            entry.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
            'bg-white/5 text-gray-300'
          }`}>
            {entry.tokenNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{entry.patientId?.name || 'Patient'}</span>
              {entry.priority !== 'normal' && (
                <Badge
                  variant={entry.priority === 'emergency' ? 'emergency' : 'urgent'}
                  pulse={entry.priority === 'emergency'}
                >
                  {entry.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Hash className="w-3 h-3" /> #{entry.position}
              </span>
              {entry.status === 'waiting' && entry.estimatedWaitMinutes && (
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Timer className="w-3 h-3" /> ~{entry.estimatedWaitMinutes}min
                </span>
              )}
              {entry.status === 'in-consultation' && entry.startedAt && (
                <span className="text-teal-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {getDuration(entry.startedAt)}
                </span>
              )}
              {entry.status === 'completed' && entry.startedAt && entry.completedAt && (
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {getDuration(entry.startedAt, entry.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              entry.status === 'in-consultation' ? 'in-consultation' :
              entry.status === 'completed' ? 'completed' :
              entry.status === 'cancelled' ? 'cancelled' : 'waiting'
            }
          >
            {entry.status === 'in-consultation' ? 'Active' : entry.status}
          </Badge>
          {expandedEntry === entry._id ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expandedEntry === entry._id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-3">
                {entry.patientId?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-400">{entry.patientId.phone}</span>
                  </div>
                )}
                {entry.appointmentType && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-400 capitalize">{entry.appointmentType}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">
                    Joined {new Date(entry.joinedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Allergies */}
              {entry.patientId?.allergies && entry.patientId.allergies.length > 0 && (
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-yellow-400 text-xs font-medium mb-1">Allergies</div>
                  <div className="flex flex-wrap gap-1">
                    {entry.patientId.allergies.map((a, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Reason */}
              {entry.emergencyReason && (
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-red-400 text-xs font-medium mb-1">Emergency Reason</div>
                  <p className="text-red-300 text-sm">{entry.emergencyReason}</p>
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <div className="p-2 bg-white/5 rounded-lg">
                  <div className="text-gray-400 text-xs font-medium mb-1">Notes</div>
                  <p className="text-gray-300 text-sm">{entry.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {entry.status === 'waiting' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                        setShowCancelModal(true);
                      }}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {entry.status === 'in-consultation' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(entry);
                      setShowCompleteModal(true);
                    }}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Queue Details</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {queueStatus === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Pause className="w-4 h-4" />}
              onClick={handleTogglePause}
              className="text-yellow-400"
            >
              Pause
            </Button>
          ) : queueStatus === 'paused' ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={handleTogglePause}
              className="text-green-400"
            >
              Resume
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <GlassCard className="text-center py-3">
          <div className="text-yellow-400 font-bold text-lg">{waitingEntries.length}</div>
          <div className="text-gray-500 text-xs">Waiting</div>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <div className="text-teal-400 font-bold text-lg">{inConsultation.length}</div>
          <div className="text-gray-500 text-xs">Active</div>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <div className="text-green-400 font-bold text-lg">{completedEntries.length}</div>
          <div className="text-gray-500 text-xs">Done</div>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <div className="text-gray-400 font-bold text-lg">{cancelledEntries.length}</div>
          <div className="text-gray-500 text-xs">Cancelled</div>
        </GlassCard>
      </div>

      {/* Currently In Consultation */}
      {inConsultation.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            Currently Consulting
          </h2>
          <div className="space-y-2">
            {inConsultation.map((entry, i) => renderEntryCard(entry, i))}
          </div>
        </div>
      )}

      {/* Call Next Button */}
      {queueStatus === 'active' && waitingEntries.length > 0 && (
        <Button
          variant="primary"
          className="w-full"
          size="lg"
          leftIcon={<SkipForward className="w-5 h-5" />}
          isLoading={isProcessing}
          onClick={handleCallNext}
        >
          Call Next Patient
        </Button>
      )}

      {/* Waiting Queue */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          Waiting Queue ({waitingEntries.length})
        </h2>
        {waitingEntries.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-gray-500 text-sm">No patients waiting</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {waitingEntries.map((entry, i) => renderEntryCard(entry, i))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completedEntries.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Completed Today ({completedEntries.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedEntries.map((entry, i) => renderEntryCard(entry, i))}
          </div>
        </div>
      )}

      {/* Complete Consultation Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Consultation"
      >
        <div className="space-y-4">
          {selectedEntry && (
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white font-medium">{selectedEntry.patientId?.name}</div>
              <div className="text-gray-400 text-sm">Token: {selectedEntry.tokenNumber}</div>
            </div>
          )}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Consultation Notes</label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Add notes about the consultation..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none min-h-[120px]"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              isLoading={isProcessing}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={handleComplete}
            >
              Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Entry Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Queue Entry"
      >
        <div className="space-y-4">
          {selectedEntry && (
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-white font-medium">{selectedEntry.patientId?.name}</div>
              <div className="text-gray-400 text-sm">Token: {selectedEntry.tokenNumber}</div>
            </div>
          )}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Reason for Cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 resize-none min-h-[80px]"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCancelModal(false)}>
              Keep
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              isLoading={isProcessing}
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={handleCancel}
            >
              Cancel Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QueueDetailsScreen;
