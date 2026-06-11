/**
 * QueueEase V2 — Doctor Availability Controller
 */

const DoctorAvailability = require('../models/DoctorAvailability');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get doctor's availability
 * @route   GET /api/availability/:doctorId
 * @access  Public
 */
exports.getAvailability = async (req, res, next) => {
  try {
    const availability = await DoctorAvailability.findOne({
      doctorId: req.params.doctorId,
    }).populate('doctorId', 'name specialization');
    
    if (!availability) {
      return sendError(res, 'Availability not found', 404);
    }
    
    sendSuccess(res, availability, 'Availability retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set doctor's weekly schedule
 * @route   PUT /api/availability/:doctorId/schedule
 * @access  Private (Doctor — self only)
 */
exports.setWeeklySchedule = async (req, res, next) => {
  try {
    const { weeklySchedule, clinicId } = req.body;
    
    if (req.params.doctorId !== req.user._id.toString() && req.user.role !== 'doctor') {
      return sendError(res, 'Not authorized', 403);
    }
    
    let availability = await DoctorAvailability.findOne({ doctorId: req.params.doctorId });
    
    if (!availability) {
      availability = await DoctorAvailability.create({
        doctorId: req.params.doctorId,
        clinicId,
        weeklySchedule,
      });
    } else {
      availability.weeklySchedule = weeklySchedule;
      await availability.save();
    }
    
    sendSuccess(res, availability, 'Weekly schedule updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add availability override (holiday, leave, etc.)
 * @route   POST /api/availability/:doctorId/override
 * @access  Private (Doctor)
 */
exports.addOverride = async (req, res, next) => {
  try {
    const { date, isAvailable, reason, customHours } = req.body;
    
    const availability = await DoctorAvailability.findOne({
      doctorId: req.params.doctorId,
    });
    
    if (!availability) {
      return sendError(res, 'Availability profile not found. Set schedule first.', 404);
    }
    
    availability.overrides.push({ date, isAvailable, reason, customHours });
    await availability.save();
    
    sendSuccess(res, availability, 'Override added');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current doctor status
 * @route   PUT /api/availability/:doctorId/status
 * @access  Private (Doctor)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const availability = await DoctorAvailability.findOneAndUpdate(
      { doctorId: req.params.doctorId },
      { currentStatus: status },
      { new: true }
    );
    
    if (!availability) {
      return sendError(res, 'Availability profile not found', 404);
    }
    
    sendSuccess(res, availability, 'Status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if doctor is available on a specific date
 * @route   GET /api/availability/:doctorId/check
 * @access  Public
 */
exports.checkAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    const availability = await DoctorAvailability.findOne({
      doctorId: req.params.doctorId,
    });
    
    if (!availability) {
      return sendSuccess(res, { isAvailable: false, reason: 'No schedule set' }, 'Availability checked');
    }
    
    const checkDate = new Date(date);
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Check overrides first
    const override = availability.overrides.find(o => {
      const overrideDate = new Date(o.date);
      return overrideDate.toDateString() === checkDate.toDateString();
    });
    
    if (override) {
      return sendSuccess(res, {
        isAvailable: override.isAvailable,
        reason: override.reason,
        customHours: override.customHours,
      }, 'Availability checked');
    }
    
    const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
    
    sendSuccess(res, {
      isAvailable: daySchedule?.isAvailable ?? false,
      timeSlots: daySchedule?.timeSlots ?? [],
      day: dayName,
    }, 'Availability checked');
  } catch (error) {
    next(error);
  }
};
