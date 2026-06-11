/**
 * QueueEase V2 — Appointment Controller
 */

const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Clinic = require('../models/Clinic');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getSocketIO } = require('../sockets');

/**
 * @desc    Create appointment
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { clinicId, doctorId, date, timeSlot, type, reason, symptoms } = req.body;
    
    // Check clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    
    // Check for time slot conflicts
    const appointmentDate = new Date(date);
    const existingAppointment = await Appointment.findOne({
      clinicId,
      doctorId,
      date: appointmentDate,
      'timeSlot.start': timeSlot.start,
      status: { $in: ['scheduled', 'confirmed'] },
    });
    
    if (existingAppointment) {
      return sendError(res, 'This time slot is already booked', 409);
    }
    
    const appointment = await Appointment.create({
      patientId: req.user._id,
      clinicId,
      doctorId,
      date: appointmentDate,
      timeSlot,
      type,
      reason,
      symptoms,
    });
    
    await appointment.populate('clinicId', 'name address');
    await appointment.populate('doctorId', 'name specialization');
    
    // Notify doctor
    await Notification.create({
      userId: doctorId,
      type: 'appointment-confirmed',
      title: 'New Appointment',
      body: `New ${type} appointment with ${req.user.name} on ${appointmentDate.toLocaleDateString()}`,
      clinicId,
      appointmentId: appointment._id,
    });
    
    sendSuccess(res, appointment, 'Appointment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my appointments
 * @route   GET /api/appointments/my
 * @access  Private
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    }
    // Receptionist can see all for their clinic
    
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone')
      .populate('clinicId', 'name address')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Appointment.countDocuments(filter);
    
    sendSuccess(res, appointments, 'Appointments retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone email')
      .populate('clinicId', 'name address phone')
      .populate('doctorId', 'name specialization');
    
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }
    
    sendSuccess(res, appointment, 'Appointment retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-in for appointment (adds to queue)
 * @route   POST /api/appointments/:id/check-in
 * @access  Private (Patient or Receptionist)
 */
exports.checkIn = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }
    
    if (appointment.status !== 'confirmed' && appointment.status !== 'scheduled') {
      return sendError(res, 'Appointment cannot be checked in', 400);
    }
    
    appointment.status = 'checked-in';
    await appointment.save();
    
    // Auto-join queue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let queue = await Queue.findOne({
      clinicId: appointment.clinicId,
      date: today,
    });
    
    if (queue) {
      const tokenNumber = queue.generateToken();
      const position = queue.getNextPosition();
      
      const entry = {
        patientId: appointment.patientId,
        patientName: req.user.name,
        tokenNumber,
        position,
        appointmentType: 'appointment',
        estimatedWaitMinutes: queue.getWaitingCount() * (queue.stats.averageConsultationMinutes || 15),
        joinedAt: new Date(),
      };
      
      queue.entries.push(entry);
      queue.reorderByPriority();
      await queue.save();
      
      appointment.queueId = queue._id;
      appointment.queueEntryId = queue.entries[queue.entries.length - 1]._id;
      appointment.tokenNumber = tokenNumber;
      await appointment.save();
      
      // Emit real-time update
      const io = getSocketIO();
      if (io) {
        io.to(`queue-${queue._id}`).emit('queue-updated', {
          queueId: queue._id,
          action: 'patient-joined',
          waitingCount: queue.getWaitingCount(),
        });
      }
    }
    
    sendSuccess(res, appointment, 'Checked in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel appointment
 * @route   POST /api/appointments/:id/cancel
 * @access  Private
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = reason;
    await appointment.save();
    
    sendSuccess(res, appointment, 'Appointment cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get clinic appointments (for doctor/receptionist)
 * @route   GET /api/appointments/clinic/:clinicId
 * @access  Private (Doctor, Receptionist)
 */
exports.getClinicAppointments = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const { date, status } = req.query;
    
    const filter = { clinicId };
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name specialization')
      .sort({ 'timeSlot.start': 1 });
    
    sendSuccess(res, appointments, 'Clinic appointments retrieved');
  } catch (error) {
    next(error);
  }
};
