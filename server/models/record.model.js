const db = require('../config/db.config');

class Record {
    static async generateRegId() {
        const currentYear = new Date().getFullYear().toString();
        // Generate the next auto increment reg_id like '2026000001'
        const [rows] = await db.execute(
            'SELECT reg_id FROM record_master WHERE reg_id LIKE ? ORDER BY reg_id DESC LIMIT 1',
            [`${currentYear}%`]
        );

        let nextId = 1;
        if (rows.length > 0) {
            const lastRegId = String(rows[0].reg_id);
            const lastIdSequence = parseInt(lastRegId.substring(4), 10);
            nextId = lastIdSequence + 1;
        }
        return currentYear + nextId.toString().padStart(6, '0');
    }

    static async create(recordData) {
        const regId = await this.generateRegId();
        const sql = `
            INSERT INTO record_master (
                reg_id, reg_no_12th, aadhaar_no, std_dob, std_name, std_mobile_no, std_whatsapp_no,
                city, last_studied_name, last_studied, community, admission_quota, reference_type,
                reference_way, reference_name, reference_email, reference_institution, reference_dept,
                reference_contact_no, selected_dept, selected_ug_pg, selected_course
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            regId, recordData.reg_no_12th, recordData.aadhaar_no, recordData.std_dob, recordData.std_name,
            recordData.std_mobile_no, recordData.std_whatsapp_no, recordData.city, recordData.last_studied_name,
            recordData.last_studied, recordData.community, recordData.admission_quota, recordData.reference_type,
            recordData.reference_way, recordData.reference_name, recordData.reference_email, recordData.reference_institution,
            recordData.reference_dept, recordData.reference_contact_no, recordData.selected_dept, recordData.selected_ug_pg,
            recordData.selected_course
        ];

        const [result] = await db.execute(sql, values);
        return { id: result.insertId, reg_id: regId };
    }

    static async autoArchive() {
        // Fetch the configuration from valid_date_master
        const [masterRows] = await db.execute('SELECT date_count, archive_status FROM valid_date_master LIMIT 1');
        const config = masterRows.length > 0 ? masterRows[0] : { date_count: 3, archive_status: 'Enquiry,Discontinue' };
        
        const daysLimit = config.date_count;
        const targetStatuses = config.archive_status.split(',').map(s => s.trim());

        if (targetStatuses.length === 0) return;

        // Create placeholders for the IN clause
        const placeholders = targetStatuses.map(() => '?').join(',');

        // Update records to 'Archived' if they match the status and date limit
        const sql = `
            UPDATE record_master 
            SET archive_status = 'Archived' 
            WHERE archive_status = 'New' 
            AND admission_status IN (${placeholders})
            AND admission_date_time < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        
        await db.execute(sql, [...targetStatuses, daysLimit]);
    }

    static async getAll(filters) {
        let sql = 'SELECT * FROM record_master WHERE 1=1';
        let params = [];

        // Archive Status Filter (Default to 'New' if not specified)
        const archiveStatus = filters.isArchived === 'true' ? 'Archived' : 'New';
        sql += ' AND archive_status = ?';
        params.push(archiveStatus);

        if (filters.search) {
            sql += ' AND (std_name LIKE ? OR reg_id LIKE ? OR std_mobile_no LIKE ? OR city LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.status) {
            sql += ' AND admission_status = ?';
            params.push(filters.status);
        }

        if (filters.fromDate && filters.toDate) {
            sql += ' AND admission_date_time >= ? AND admission_date_time <= ?';
            params.push(filters.fromDate, filters.toDate);
        }

        sql += ' ORDER BY admission_date_time DESC';

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM record_master WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async updateStatus(id, status) {
        const sql = 'UPDATE record_master SET admission_status = ? WHERE id = ?';
        const [result] = await db.execute(sql, [status, id]);
        return result.affectedRows > 0;
    }

    static async getStats() {
        // Count by admission_status for active records (archive_status = 'New')
        const [statusCounts] = await db.execute(`
            SELECT admission_status, COUNT(*) as count 
            FROM record_master 
            WHERE archive_status = 'New' 
            GROUP BY admission_status
        `);

        // Count active vs archived
        const [archiveCounts] = await db.execute(`
            SELECT archive_status, COUNT(*) as count 
            FROM record_master 
            GROUP BY archive_status
        `);

        const stats = {
            Enquiry: 0,
            Admitted: 0,
            Discontinue: 0,
            TotalActive: 0,
            TotalArchived: 0
        };

        statusCounts.forEach(row => {
            if (row.admission_status in stats) {
                stats[row.admission_status] = row.count;
            }
        });

        archiveCounts.forEach(row => {
            if (row.archive_status === 'New') stats.TotalActive = row.count;
            if (row.archive_status === 'Archived') stats.TotalArchived = row.count;
        });

        return stats;
    }
}

module.exports = Record;
