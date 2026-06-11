/**
 * QueueEase V2 — Analytics Controller
 * Provides dashboard analytics for doctors and receptionists.
 */

const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/analytics/dashboard
 * @access  Private (Doctor, Receptionist)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { clinicId, period = 'today' } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's queue stats
    const todayQueue = await Queue.findOne({
      clinicId,
      date: today,
    });
    
    const stats = {
      today: {
        totalPatients: todayQueue?.stats.totalPatients || 0,
        completed: todayQueue?.stats.completed || 0,
        waiting: todayQueue?.getWaitingCount() || 0,
        emergencies: todayQueue?.stats.emergencies || 0,
        avgWaitMinutes: todayQueue?.stats.averageWaitMinutes || 0,
        avgConsultationMinutes: todayQueue?.stats.averageConsultationMinutes || 0,
        status: todayQueue?.status || 'not-started',
      },
    };
    
    // Last 7 days trend
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyAnalytics = await Analytics.find({
      clinicId,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });
    
    stats.weeklyTrend = weeklyAnalytics;
    
    // Upcoming appointments
    const upcomingAppointments = await Appointment.countDocuments({
      clinicId,
      date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] },
    });
    
    stats.upcomingAppointments = upcomingAppointments;
    
    sendSuccess(res, stats, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analytics for a date range
 * @route   GET /api/analytics/range
 * @access  Private (Doctor, Receptionist)
 */
exports.getAnalyticsRange = async (req, res, next) => {
  try {
    const { clinicId, startDate, endDate } = req.query;
    
    const analytics = await Analytics.find({
      clinicId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });
    
    // Aggregate summary
    const summary = {
      totalPatients: 0,
      totalCompleted: 0,
      totalCancelled: 0,
      totalNoShows: 0,
      totalEmergencies: 0,
      avgWaitMinutes: 0,
      avgConsultationMinutes: 0,
      peakHour: null,
    };
    
    analytics.forEach(a => {
      summary.totalPatients += a.totalPatients;
      summary.totalCompleted += a.completed;
      summary.totalCancelled += a.cancelled;
      summary.totalNoShows += a.noShows;
      summary.totalEmergencies += a.emergencies;
    });
    
    if (analytics.length > 0) {
      summary.avgWaitMinutes = Math.round(
        analytics.reduce((sum, a) => sum + a.averageWaitMinutes, 0) / analytics.length
      );
      summary.avgConsultationMinutes = Math.round(
        analytics.reduce((sum, a) => sum + a.averageConsultationMinutes, 0) / analytics.length
      );
    }
    
    sendSuccess(res, { analytics, summary }, 'Analytics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hourly distribution for today
 * @route   GET /api/analytics/hourly
 * @access  Private (Doctor, Receptionist)
 */
exports.getHourlyDistribution = async (req, res, next) => {
  try {
    const { clinicId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAnalytics = await Analytics.findOne({
      clinicId,
      date: today,
    });
    
    sendSuccess(res, todayAnalytics?.hourlyBreakdown || [], 'Hourly distribution retrieved');
  } catch (error) {
    next(error);
  }
};
