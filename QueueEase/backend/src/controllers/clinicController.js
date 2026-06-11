/**
 * QueueEase V2 — Clinic Controller
 */

const Clinic = require('../models/Clinic');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const isStringQuery = (value) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0].trim();
  return '';
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSafeRegex = (value) => {
  if (!value) return null;
  const safeValue = value.slice(0, 100);
  return new RegExp(escapeRegex(safeValue), 'i');
};

/**
 * @desc    Create clinic
 * @route   POST /api/clinics
 * @access  Private (Doctor)
 */
exports.createClinic = async (req, res, next) => {
  try {
    const clinicData = { ...req.body, doctorId: req.user._id };
    const clinic = await Clinic.create(clinicData);
    sendSuccess(res, clinic, 'Clinic created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all clinics
 * @route   GET /api/clinics
 * @access  Public
 */
exports.getClinics = async (req, res, next) => {
  try {
    const { city, district, specialty, search, page = 1, limit = 20 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return sendError(res, 'Invalid page parameter', 400);
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return sendError(res, 'Invalid limit parameter', 400);
    }

    const filter = { isActive: true };

    const cityQuery = isStringQuery(city);
    const districtQuery = isStringQuery(district);
    const specialtyQuery = isStringQuery(specialty);
    const searchQuery = isStringQuery(search);

    const cityRegex = buildSafeRegex(cityQuery);
    const districtRegex = buildSafeRegex(districtQuery);
    const specialtyRegex = buildSafeRegex(specialtyQuery);
    const searchRegex = buildSafeRegex(searchQuery);

    if (cityRegex) filter['address.city'] = cityRegex;
    if (districtRegex) filter['address.district'] = districtRegex;
    if (specialtyRegex) filter.specialty = specialtyRegex;
    if (searchRegex) filter.name = searchRegex;

    const clinics = await Clinic.find(filter)
      .populate('doctorId', 'name specialization')
      .sort({ 'rating.average': -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Clinic.countDocuments(filter);

    sendSuccess(res, { clinics, total, page: pageNumber, pages: Math.ceil(total / limitNumber) }, 'Clinics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get clinic by ID
 * @route   GET /api/clinics/:id
 * @access  Public
 */
exports.getClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate('doctorId', 'name specialization phone')
      .populate('receptionistIds', 'name phone');
    
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    
    sendSuccess(res, clinic, 'Clinic retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update clinic
 * @route   PUT /api/clinics/:id
 * @access  Private (Doctor — owner)
 */
exports.updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    
    // Only owner doctor can update
    if (clinic.doctorId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this clinic', 403);
    }
    
    const updated = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    sendSuccess(res, updated, 'Clinic updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my clinics (doctor's clinics)
 * @route   GET /api/clinics/my
 * @access  Private (Doctor)
 */
exports.getMyClinics = async (req, res, next) => {
  try {
    const clinics = await Clinic.find({ doctorId: req.user._id });
    sendSuccess(res, clinics, 'Your clinics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add receptionist to clinic
 * @route   POST /api/clinics/:id/receptionist
 * @access  Private (Doctor — owner)
 */
exports.addReceptionist = async (req, res, next) => {
  try {
    const { receptionistId } = req.body;
    const clinic = await Clinic.findById(req.params.id);
    
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    
    if (clinic.doctorId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403);
    }
    
    if (clinic.receptionistIds.includes(receptionistId)) {
      return sendError(res, 'Receptionist already added', 409);
    }
    
    clinic.receptionistIds.push(receptionistId);
    await clinic.save();
    
    sendSuccess(res, clinic, 'Receptionist added');
  } catch (error) {
    next(error);
  }
};
