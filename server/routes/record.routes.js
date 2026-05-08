const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route for submitting enquiry
router.post('/', recordController.createRecord);

// Protected route for admin datatable
router.get('/', authMiddleware, recordController.getRecords);

// Protected route to update status
router.put('/:id/status', authMiddleware, recordController.updateStatus);

// Protected route for stats
router.get('/stats', authMiddleware, recordController.getStats);

module.exports = router;
