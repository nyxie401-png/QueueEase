/**
 * QueueEase V2 — Queue Routes
 */

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/auth');
const { joinQueueValidation } = require('../middleware/validators');

router.get('/clinic/:clinicId/today', protect, queueController.getTodayQueue);
router.get('/:queueId', protect, queueController.getQueueDetails);

router.post(
  '/:queueId/join',
  protect,
  authorize('patient', 'receptionist'),
  joinQueueValidation,
  queueController.joinQueue
);

router.post(
  '/:queueId/call-next',
  protect,
  authorize('doctor', 'receptionist'),
  queueController.callNext
);

router.post(
  '/:queueId/complete',
  protect,
  authorize('doctor'),
  queueController.completeConsultation
);

router.post(
  '/:queueId/cancel/:entryId',
  protect,
  queueController.cancelEntry
);

router.post(
  '/:queueId/pause',
  protect,
  authorize('doctor', 'receptionist'),
  queueController.togglePause
);

router.post(
  '/:queueId/close',
  protect,
  authorize('doctor'),
  queueController.closeQueue
);

router.post(
  '/:queueId/emergency',
  protect,
  authorize('doctor', 'receptionist'),
  queueController.addEmergency
);

router.put(
  '/:queueId/entry/:entryId/wait-time',
  protect,
  queueController.updateWaitTime
);

module.exports = router;
