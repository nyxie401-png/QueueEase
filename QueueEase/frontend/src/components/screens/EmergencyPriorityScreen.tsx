import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Siren,
  Clock,
  User,
  Phone,
  Heart,
  FileText,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  X,
  ChevronRight,
  Shield,
  Activity,
  Zap,
  Thermometer,
  Stethoscope,
  Send,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useQueueStore } from '../../stores/queueStore';

interface EmergencyEntry {
  id: string;
  patientName: string;
  tokenNumber: string;
  reason: string;
  severity: 'critical' | 'urgent' | 'moderate';
  vitals?: {
    bp?: string;
    pulse?: number;
    temperature?: number;
    spO2?: number;
  };
  addedAt: string;
  position: number;
  status: 'waiting' | 'in-consultation' | 'completed';
}

const EmergencyPriorityScreen: React.FC = () => {
  const { addEmergency } = useQueueStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'critical' | 'urgent' | 'moderate'>('urgent');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'protocols'>('active');

  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spO2, setSpO2] = useState('');

  // Mock emergency entries
  const [emergencyEntries] = useState<EmergencyEntry[]>([
    {
      id: '1',
      patientName: 'Kumar Perera',
      tokenNumber: 'E-001',
      reason: 'Severe chest pain, difficulty breathing',
      severity: 'critical',
      vitals: { bp: '180/110', pulse: 110, temperature: 38.5, spO2: 92 },
      addedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      position: 1,
      status: 'in-consultation',
    },
    {
      id: '2',
      patientName: 'Nimali Silva',
      tokenNumber: 'E-002',
      reason: 'High fever with persistent vomiting, dehydration',
      severity: 'urgent',
      vitals: { bp: '130/85', pulse: 95, temperature: 39.2, spO2: 97 },
      addedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      position: 2,
      status: 'waiting',
    },
    {
      id: '3',
      patientName: 'Ranjith Fernando',
      tokenNumber: 'E-003',
      reason: 'Severe allergic reaction, swelling in throat',
      severity: 'critical',
      vitals: { bp: '90/60', pulse: 120, temperature: 37.0, spO2: 94 },
      addedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      position: 3,
      status: 'waiting',
    },
  ]);

  const completedEmergencies: EmergencyEntry[] = [
    {
      id: '4',
      patientName: 'Amal Jayawardena',
      tokenNumber: 'E-004',
      reason: 'Asthma attack, difficulty breathing',
      severity: 'urgent',
      addedAt: new Date(Date.now() - 60 * 60000).toISOString(),
      position: 0,
      status: 'completed',
    },
  ];

  const handleAddEmergency = async () => {
    if (!patientName || !reason) return;
    setIsAdding(true);
    try {
      await addEmergency({
        patientName,
        patientPhone,
        reason,
        severity: selectedSeverity,
        vitals: bp || pulse || temperature || spO2 ? {
          bp: bp || undefined,
          pulse: pulse ? parseInt(pulse) : undefined,
          temperature: temperature ? parseFloat(temperature) : undefined,
          spO2: spO2 ? parseInt(spO2) : undefined,
        } : undefined,
      });
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to add emergency:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setPatientName('');
    setPatientPhone('');
    setReason('');
    setBp('');
    setPulse('');
    setTemperature('');
    setSpO2('');
    setSelectedSeverity('urgent');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' };
      case 'urgent': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: '' };
      default: return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: '' };
    }
  };

  const protocols = [
    {
      title: 'Cardiac Emergency',
      icon: <Heart className="w-5 h-5 text-red-400" />,
      steps: [
        'Call for immediate medical assistance',
        'Keep patient calm and seated',
        'Administer aspirin if available and no allergies',
        'Monitor vitals every 2 minutes',
        'Prepare AED if available',
      ],
      severity: 'critical',
    },
    {
      title: 'Respiratory Distress',
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      steps: [
        'Position patient upright',
        'Administer supplemental oxygen if available',
        'Monitor SpO2 levels continuously',
        'Keep airway clear',
        'Prepare nebulizer if available',
      ],
      severity: 'critical',
    },
    {
      title: 'Severe Allergic Reaction',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      steps: [
        'Remove allergen source if identified',
        'Administer epinephrine if available and trained',
        'Monitor airway and breathing',
        'Position patient on back with legs elevated',
        'Call emergency services if worsening',
      ],
      severity: 'critical',
    },
    {
      title: 'High Fever / Infection',
      icon: <Thermometer className="w-5 h-5 text-orange-400" />,
      steps: [
        'Monitor temperature regularly',
        'Administer antipyretics if available',
        'Ensure adequate hydration',
        'Keep patient comfortable and rested',
        'Watch for signs of sepsis',
      ],
      severity: 'urgent',
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header with Emergency Banner */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Siren className="w-6 h-6 text-red-400" />
              Emergency Priority
            </h1>
            <p className="text-gray-400 text-sm mt-1">Priority queue for emergency cases</p>
          </div>
          <Button
            variant="emergency"
            leftIcon={<Zap className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Emergency
          </Button>
        </div>

        {/* Critical Alert Banner */}
        {emergencyEntries.filter((e) => e.severity === 'critical' && e.status !== 'completed').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-red-400 font-semibold text-sm">
                {emergencyEntries.filter((e) => e.severity === 'critical' && e.status !== 'completed').length} Critical Case(s) Active
              </div>
              <div className="text-red-300/70 text-xs">Immediate attention required — patients moved to front of queue</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: 'active', label: 'Active', count: emergencyEntries.filter((e) => e.status !== 'completed').length },
          { key: 'completed', label: 'Completed', count: completedEmergencies.length },
          { key: 'protocols', label: 'Protocols', count: protocols.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[48px] ${
              activeTab === tab.key
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-red-500/30' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {emergencyEntries.filter((e) => e.status !== 'completed').length === 0 ? (
            <GlassCard className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg">No Active Emergencies</h3>
              <p className="text-gray-400 text-sm mt-2">All clear — no emergency cases at this time</p>
            </GlassCard>
          ) : (
            <AnimatePresence>
              {emergencyEntries
                .filter((e) => e.status !== 'completed')
                .sort((a, b) => {
                  const severityOrder = { critical: 0, urgent: 1, moderate: 2 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .map((entry, index) => {
                  const colors = getSeverityColor(entry.severity);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard className={`${colors.glow} border ${colors.border}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                              <Siren className={`w-6 h-6 ${colors.text}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-semibold">{entry.patientName}</h3>
                                <Badge
                                  variant={entry.severity === 'critical' ? 'emergency' : 'urgent'}
                                  pulse={entry.severity === 'critical'}
                                >
                                  {entry.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-gray-400 text-sm mt-1">{entry.reason}</div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(entry.addedAt).toLocaleTimeString()}
                                </span>
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  Position #{entry.position}
                                </span>
                                {entry.status === 'in-consultation' && (
                                  <Badge variant="in-consultation">With Doctor</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`text-2xl font-mono font-bold ${colors.text}`}>
                            {entry.tokenNumber}
                          </div>
                        </div>

                        {/* Vitals */}
                        {entry.vitals && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {entry.vitals.bp && (
                              <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                                <div className="text-gray-500 text-[10px] uppercase">BP</div>
                                <div className={`text-sm font-bold ${
                                  parseInt(entry.vitals.bp) > 160 ? 'text-red-400' : 'text-white'
                                }`}>
                                  {entry.vitals.bp}
                                </div>
                              </div>
                            )}
                            {entry.vitals.pulse && (
                              <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                                <div className="text-gray-500 text-[10px] uppercase">Pulse</div>
                                <div className={`text-sm font-bold ${
                                  entry.vitals.pulse > 100 ? 'text-red-400' : 'text-white'
                                }`}>
                                  {entry.vitals.pulse} bpm
                                </div>
                              </div>
                            )}
                            {entry.vitals.temperature && (
                              <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                                <div className="text-gray-500 text-[10px] uppercase">Temp</div>
                                <div className={`text-sm font-bold ${
                                  entry.vitals.temperature > 38 ? 'text-red-400' : 'text-white'
                                }`}>
                                  {entry.vitals.temperature}°C
                                </div>
                              </div>
                            )}
                            {entry.vitals.spO2 && (
                              <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                                <div className="text-gray-500 text-[10px] uppercase">SpO2</div>
                                <div className={`text-sm font-bold ${
                                  entry.vitals.spO2 < 95 ? 'text-red-400' : 'text-white'
                                }`}>
                                  {entry.vitals.spO2}%
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedEmergencies.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-gray-400">No completed emergencies today</p>
            </GlassCard>
          ) : (
            completedEmergencies.map((entry) => (
              <GlassCard key={entry.id} className="opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium text-sm">{entry.patientName}</div>
                      <div className="text-gray-400 text-xs">{entry.reason}</div>
                    </div>
                  </div>
                  <Badge variant="completed">Completed</Badge>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Quick reference emergency protocols for clinic staff
          </p>
          {protocols.map((protocol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${
                    protocol.severity === 'critical' ? 'bg-red-500/10' : 'bg-orange-500/10'
                  } flex items-center justify-center flex-shrink-0`}>
                    {protocol.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm">{protocol.title}</h3>
                      <Badge variant={protocol.severity === 'critical' ? 'emergency' : 'urgent'}>
                        {protocol.severity}
                      </Badge>
                    </div>
                    <ol className="space-y-1.5">
                      {protocol.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                          <span className="text-teal-400 text-xs font-bold mt-0.5">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Emergency Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Emergency Patient"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Severity Selection */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Severity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'urgent', 'moderate'] as const).map((level) => {
                const colors = getSeverityColor(level);
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedSeverity(level)}
                    className={`py-3 px-2 rounded-xl text-center transition-all min-h-[48px] capitalize ${
                      selectedSeverity === level
                        ? `${colors.bg} border ${colors.border} ${colors.text}`
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{level}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">
                      {level === 'critical' ? 'Life-threatening' : level === 'urgent' ? 'Needs quick attention' : 'Can wait briefly'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Patient Name *"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            placeholder="Enter patient name"
          />

          <Input
            label="Phone Number"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="Enter phone number"
          />

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Reason for Emergency *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 resize-none min-h-[100px]"
            />
          </div>

          {/* Vitals (Optional) */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Vitals (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Blood Pressure"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="e.g., 120/80"
              />
              <Input
                label="Pulse (bpm)"
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="e.g., 72"
              />
              <Input
                label="Temperature (°C)"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 37.0"
              />
              <Input
                label="SpO2 (%)"
                type="number"
                value={spO2}
                onChange={(e) => setSpO2(e.target.value)}
                placeholder="e.g., 98"
              />
            </div>
          </div>

          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs">
              Emergency patients are automatically moved to the front of the queue. Critical cases take highest priority.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              variant="emergency"
              className="flex-1"
              isLoading={isAdding}
              leftIcon={<Siren className="w-4 h-4" />}
              disabled={!patientName || !reason}
              onClick={handleAddEmergency}
            >
              Add to Emergency Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmergencyPriorityScreen;
