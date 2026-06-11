import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  RefreshCw,
  ArrowRight,
  Stethoscope,
  Hash,
  Timer,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TokenDisplay } from '../ui/TokenDisplay';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { useQueueStore } from '../../stores/queueStore';
import { useSocket } from '../../hooks';

interface QueueEntry {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    phone?: string;
  };
  tokenNumber: string;
  position: number;
  status: 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'emergency';
  priority: 'normal' | 'urgent' | 'emergency';
  appointmentType: 'walk-in' | 'appointment' | 'emergency';
  estimatedWaitMinutes?: number;
  joinedAt: string;
  startedAt?: string;
  completedAt?: string;
  emergencyReason?: string;
}

interface QueueData {
  _id: string;
  clinicId: string;
  date: string;
  entries: QueueEntry[];
  status: 'active' | 'paused' | 'closed';
  currentToken?: string;
  stats: {
    totalPatients: number;
    completedPatients: number;
    cancelledPatients: number;
    averageWaitMinutes: number;
    averageConsultationMinutes: number;
  };
}

const QueueStatusScreen: React.FC = () => {
  const { fetchTodayQueue, queue, isLoading, subscribeToQueue, unsubscribeFromQueue } = useQueueStore();
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'completed' | 'emergency'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const socketEvents = useSocket({
    'queue-updated': () => {
      if (autoRefresh) fetchTodayQueue();
    },
    'your-turn': () => {
      fetchTodayQueue();
    },
    'turn-approaching': () => {
      fetchTodayQueue();
    },
  });

  useEffect(() => {
    fetchTodayQueue();
    subscribeToQueue();

    return () => {
      unsubscribeFromQueue();
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTodayQueue();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const queueData = queue as QueueData | null;

  const filteredEntries = queueData?.entries?.filter((entry) => {
    if (filter === 'all') return true;
    if (filter === 'emergency') return entry.priority === 'emergency' || entry.priority === 'urgent';
    return entry.status === filter;
  }) || [];

  const waitingCount = queueData?.entries?.filter((e) => e.status === 'waiting').length || 0;
  const inConsultationCount = queueData?.entries?.filter((e) => e.status === 'in-consultation').length || 0;
  const completedCount = queueData?.entries?.filter((e) => e.status === 'completed').length || 0;
  const emergencyCount = queueData?.entries?.filter((e) => e.priority === 'emergency').length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'in-consultation': return <Stethoscope className="w-4 h-4 text-teal-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'border-l-red-500 bg-red-500/5';
      case 'urgent': return 'border-l-yellow-500 bg-yellow-500/5';
      default: return 'border-l-teal-500 bg-teal-500/5';
    }
  };

  if (isLoading && !queueData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Queue Status</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time queue monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchTodayQueue()}
          >
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-500'} mr-2`} />
            Auto
          </Button>
        </div>
      </div>

      {/* Queue Status Banner */}
      {queueData && (
        <GlassCard variant="neon" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {queueData.status === 'active' && (
              <div className="flex items-center gap-2 text-green-400">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Queue Active</span>
              </div>
            )}
            {queueData.status === 'paused' && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Pause className="w-5 h-5" />
                <span className="font-semibold">Queue Paused</span>
              </div>
            )}
            {queueData.status === 'closed' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Queue Closed</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Current Token: <span className="text-teal-400 font-mono font-bold text-lg">{queueData.currentToken || '---'}</span>
          </div>
        </GlassCard>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{waitingCount}</div>
          <div className="text-xs text-gray-400 mt-1">Waiting</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-teal-400">{inConsultationCount}</div>
          <div className="text-xs text-gray-400 mt-1">In Consultation</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-green-400">{completedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-red-400">{emergencyCount}</div>
          <div className="text-xs text-gray-400 mt-1">Emergency</div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All', count: queueData?.entries?.length || 0 },
          { key: 'waiting', label: 'Waiting', count: waitingCount },
          { key: 'in-consultation', label: 'In Consultation', count: inConsultationCount },
          { key: 'completed', label: 'Completed', count: completedCount },
          { key: 'emergency', label: 'Emergency', count: emergencyCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[48px] ${
              filter === tab.key
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              filter === tab.key ? 'bg-teal-500/30' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Queue Entries List */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No entries found"
          description={filter === 'all' ? 'The queue is empty for today' : `No ${filter} entries in the queue`}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`border-l-4 rounded-xl p-4 ${getPriorityColor(entry.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 font-mono font-bold text-teal-400 text-lg">
                      {entry.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{entry.patientId?.name || 'Patient'}</span>
                        {getStatusIcon(entry.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-xs">
                          <Hash className="w-3 h-3 inline" /> Position {entry.position}
                        </span>
                        {entry.estimatedWaitMinutes && entry.status === 'waiting' && (
                          <span className="text-gray-400 text-xs">
                            <Timer className="w-3 h-3 inline" /> ~{entry.estimatedWaitMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        entry.priority === 'emergency' ? 'emergency' :
                        entry.priority === 'urgent' ? 'urgent' :
                        entry.status === 'in-consultation' ? 'in-consultation' :
                        entry.status === 'completed' ? 'completed' :
                        entry.status === 'cancelled' ? 'cancelled' : 'waiting'
                      }
                      pulse={entry.priority === 'emergency'}
                    >
                      {entry.priority === 'emergency' ? 'EMERGENCY' :
                       entry.priority === 'urgent' ? 'Urgent' :
                       entry.status === 'in-consultation' ? 'In Consultation' :
                       entry.status === 'completed' ? 'Completed' :
                       entry.status === 'cancelled' ? 'Cancelled' : 'Waiting'}
                    </Badge>
                  </div>
                </div>
                {entry.emergencyReason && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-xs">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {entry.emergencyReason}
                    </p>
                  </div>
                )}
                {entry.status === 'in-consultation' && (
                  <div className="mt-2 flex items-center gap-2 text-teal-400 text-xs">
                    <Stethoscope className="w-3 h-3" />
                    <span>Currently with doctor</span>
                    {entry.startedAt && (
                      <span className="text-gray-500">
                        (since {new Date(entry.startedAt).toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Average Stats */}
      {queueData?.stats && (
        <GlassCard variant="light" className="mt-6">
          <h3 className="text-white font-semibold mb-3">Today's Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-xs">Total Patients</div>
              <div className="text-white font-bold text-lg">{queueData.stats.totalPatients}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Avg Wait Time</div>
              <div className="text-white font-bold text-lg">{queueData.stats.averageWaitMinutes || 0} min</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Avg Consultation</div>
              <div className="text-white font-bold text-lg">{queueData.stats.averageConsultationMinutes || 0} min</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Completed</div>
              <div className="text-green-400 font-bold text-lg">{queueData.stats.completedPatients}</div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default QueueStatusScreen;
