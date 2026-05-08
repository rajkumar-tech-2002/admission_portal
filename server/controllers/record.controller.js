const Record = require('../models/record.model');

exports.createRecord = async (req, res, next) => {
    try {
        const result = await Record.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Enquiry submitted successfully',
            data: { reg_id: result.reg_id }
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecords = async (req, res, next) => {
    try {
        const { search, status, fromDate, toDate, isArchived } = req.query;
        const filters = { search, status, fromDate, toDate, isArchived };
        
        // Auto archive records before fetching
        await Record.autoArchive();
        
        const records = await Record.getAll(filters);
        
        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecordById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const record = await Record.getById(id);
        if (record) {
            res.status(200).json({ success: true, data: record });
        } else {
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        const success = await Record.updateStatus(id, status);
        
        if (success) {
            res.status(200).json({ success: true, message: 'Status updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const stats = await Record.getStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};
