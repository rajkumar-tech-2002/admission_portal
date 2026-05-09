const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route for submitting enquiry
router.post('/', recordController.createRecord);

// Protected route for admin datatable
router.get('/', authMiddleware, recordController.getRecords);

// Protected route for stats (must be before /:id)
router.get('/stats', authMiddleware, recordController.getStats);

// Protected route to get a single record by id
router.get('/:id', authMiddleware, recordController.getRecordById);

// Protected route to update status
router.put('/:id/status', authMiddleware, recordController.updateStatus);

// Protected route to send/resend email
router.post('/:id/send-email', authMiddleware, recordController.sendEmail);

module.exports = router;
