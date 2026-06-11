/**
 * QueueEase V2 — Queue Model
 * Manages the queue for a clinic with emergency priority support.
 */

const mongoose = require('mongoose');

const QUEUE_ENTRY_SCHEMA = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: { type: String, required: true },
  patientPhone: { type: String },
  
  // Queue position
  tokenNumber: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  
  // Status: waiting | in-consultation | completed | cancelled | no-show
  status: {
    type: String,
    enum: ['waiting', 'in-consultation', 'completed', 'cancelled', 'no-show'],
    default: 'waiting',
  },
  
  // Priority: normal | urgent | emergency
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
  },
  
  // Emergency details
  emergencyReason: {
    type: String,
    trim: true,
  },
  
  // Appointment type
  appointmentType: {
    type: String,
    enum: ['walk-in', 'appointment', 'follow-up', 'emergency'],
    default: 'walk-in',
  },
  
  // Time tracking
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  estimatedWaitMinutes: {
    type: Number,
  },
  calledAt: {
    type: Date,
  },
  consultationStartedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  
  // Consultation notes
  notes: {
    type: String,
    trim: true,
  },
  
  // AI predicted wait time
  predictedWaitMinutes: {
    type: Number,
  },
}, { _id: true });

const QUEUE_SCHEMA = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Date of the queue
  date: {
    type: Date,
    required: true,
  },
  
  // Current serving token
  currentToken: {
    type: String,
    default: null,
  },
  currentPosition: {
    type: Number,
    default: 0,
  },
  
  // Counter for token generation
  tokenCounter: {
    type: Number,
    default: 0,
  },
  
  // Queue entries
  entries: [QUEUE_ENTRY_SCHEMA],
  
  // Statistics
  stats: {
    totalPatients: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    noShows: { type: Number, default: 0 },
    emergencies: { type: Number, default: 0 },
    averageWaitMinutes: { type: Number, default: 0 },
    averageConsultationMinutes: { type: Number, default: 0 },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['open', 'paused', 'closed'],
    default: 'open',
  },
  
  // Paused reason
  pausedReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index: one active queue per clinic per doctor per date
QUEUE_SCHEMA.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });

// Method: Get next position
QUEUE_SCHEMA.methods.getNextPosition = function () {
  const waitingEntries = this.entries.filter(e => e.status === 'waiting');
  return waitingEntries.length + 1;
};

// Method: Generate token number
QUEUE_SCHEMA.methods.generateToken = function () {
  this.tokenCounter += 1;
  const prefix = 'Q';
  const dateStr = new Date().toISOString().slice(8, 10); // DD
  return `${prefix}${dateStr}-${String(this.tokenCounter).padStart(3, '0')}`;
};

// Method: Get waiting count
QUEUE_SCHEMA.methods.getWaitingCount = function () {
  return this.entries.filter(e => e.status === 'waiting').length;
};

// Method: Get emergency count
QUEUE_SCHEMA.methods.getEmergencyCount = function () {
  return this.entries.filter(e => e.status === 'waiting' && e.priority === 'emergency').length;
};

// Method: Reorder by priority (emergency first, then urgent, then normal)
QUEUE_SCHEMA.methods.reorderByPriority = function () {
  const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
  const waitingEntries = this.entries.filter(e => e.status === 'waiting');
  const otherEntries = this.entries.filter(e => e.status !== 'waiting');
  
  waitingEntries.sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 2;
    const pB = priorityOrder[b.priority] ?? 2;
    if (pA !== pB) return pA - pB;
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });
  
  // Reassign positions
  waitingEntries.forEach((entry, idx) => {
    entry.position = idx + 1;
  });
  
  this.entries = [...waitingEntries, ...otherEntries];
};

module.exports = mongoose.model('Queue', QUEUE_SCHEMA);
