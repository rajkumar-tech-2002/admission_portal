const Record = require('../models/record.model');
const pdfService = require('../services/pdf.service');
const emailService = require('../services/email.service');

exports.createRecord = async (req, res, next) => {
    try {
        const result = await Record.create(req.body);
        
        // Fetch the full record to include all details for PDF (like reg_id)
        const fullRecord = await Record.getById(result.id);
        
        // Trigger Email Sending Asynchronously (don't wait for it to respond to user)
        if (fullRecord && fullRecord.reference_email) {
            (async () => {
                try {
                    const pdfBuffer = await pdfService.generateEnquiryPdf(fullRecord);
                    await emailService.sendEnquiryEmail(fullRecord, pdfBuffer);
                } catch (err) {
                    console.error('Auto-email background process failed:', err);
                }
            })();
        }

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

exports.sendEmail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const record = await Record.getById(id);
        
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        
        if (!record.reference_email) {
            return res.status(400).json({ success: false, message: 'No reference email found for this record' });
        }
        
        // Generate PDF and Send Email
        const pdfBuffer = await pdfService.generateEnquiryPdf(record);
        const result = await emailService.sendEnquiryEmail(record, pdfBuffer);
        
        if (result.success) {
            res.status(200).json({ success: true, message: 'Email sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
        next(error);
    }
};
