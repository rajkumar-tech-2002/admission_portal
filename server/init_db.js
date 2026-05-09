require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const initDB = async () => {
    let connection;
    try {
        console.log("Connecting to MySQL without database...");
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS
        });

        console.log(`Creating database ${process.env.DB_NAME} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        const sqlQueries = `
            CREATE TABLE IF NOT EXISTS user_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_role VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS department_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                department VARCHAR(255) NOT NULL,
                type VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS study_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                study VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS community_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                community VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admission_type_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admission_type VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reference_type_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference_type VARCHAR(255) NOT NULL,
                way VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admission_status_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admission_status VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS record_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                
                reg_id VARCHAR(255) NOT NULL,
                reg_no_12th VARCHAR(255) NOT NULL,
                
                aadhaar_no VARCHAR(12) NOT NULL,
                
                std_dob DATE,
                std_name VARCHAR(255) NOT NULL,
                
                std_mobile_no VARCHAR(10) NOT NULL,
                std_whatsapp_no VARCHAR(10),
                
                city VARCHAR(255),
                
                last_studied_name LONGTEXT,
                last_studied VARCHAR(100),
                
                community VARCHAR(100),
                admission_quota VARCHAR(100),
                
                reference_type VARCHAR(100),
                reference_way VARCHAR(100),
                reference_name VARCHAR(255),
                reference_email VARCHAR(100),
                reference_institution LONGTEXT,
                reference_dept VARCHAR(255),
                reference_contact_no VARCHAR(10),
                
                selected_dept VARCHAR(255) NOT NULL,
                selected_ug_pg VARCHAR(100) NOT NULL,
                selected_course VARCHAR(255) NOT NULL,
                
                admission_status VARCHAR(255) NOT NULL DEFAULT 'Enquiry',
                
                email_status ENUM('Pending', 'Sent', 'Failed') DEFAULT 'Pending',
                email_sent_at DATETIME NULL,
                
                admission_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                archive_status VARCHAR(100) NOT NULL DEFAULT 'New',
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS email_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                record_id INT NOT NULL,
                reg_id VARCHAR(255) NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                status ENUM('Sent', 'Failed') NOT NULL,
                error_message TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (record_id) REFERENCES record_master(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS valid_date_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_count INT NOT NULL DEFAULT 30,
                archive_status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        // We need to split multiple queries as mysql2 doesn't support multipleStatements by default 
        // unless explicitly enabled, but it's safer to run them one by one or enable it.
        // Let's enable it just for setup.
        
        const multiConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log("Creating tables...");
        await multiConnection.query(sqlQueries);

        // Insert Master Data
        console.log("Inserting master data if empty...");
        const [deptCount] = await multiConnection.query('SELECT COUNT(*) as count FROM department_master');
        if (deptCount[0].count === 0) {
            await multiConnection.query(`
                INSERT INTO department_master (department, type) VALUES
                ('NPC-DAE', 'DIPLOMA'), ('NPC-DAGRI', 'DIPLOMA'), ('NPC-DCIVIL', 'DIPLOMA'), ('NPC-DCOMP', 'DIPLOMA'), 
                ('NPC-DECE', 'DIPLOMA'), ('NPC-DEEE', 'DIPLOMA'), ('NPC-DME', 'DIPLOMA'), ('NPC-DPCE', 'DIPLOMA'),
                ('NCT-M.E_CS', 'PG'), ('NCT-M.E_CSE', 'PG'), ('NEC-M.E_CSE', 'PG'), ('NEC-MBA', 'PG'), ('NEC-MCA', 'PG'),
                ('NCT-B.E_CSE', 'UG'), ('NCT-B.E_ECE', 'UG'), ('NCT-B.E_EEE', 'UG'), ('NCT-B.Tech_AI_DS', 'UG'), ('NCT-B.Tech_IT', 'UG'),
                ('NEC-B.E_AGRI', 'UG'), ('NEC-B.E_BME', 'UG'), ('NEC-B.E_CSE_CS', 'UG'), ('NEC-B.E_ECE', 'UG'), ('NEC-B.E_EEE', 'UG'), 
                ('NEC-B.E_CIVIL', 'UG'), ('NEC-B.E_CSE', 'UG'), ('NEC-B.E_MECH', 'UG'), ('NEC-B.Tech_Al_DS', 'UG'), ('NEC-B.Tech_CHEM', 'UG'), 
                ('NEC-B.Tech_IT', 'UG'), ('NEC-B.E_CSE_IOT', 'UG');
            `);
        }

        const [studyCount] = await multiConnection.query('SELECT COUNT(*) as count FROM study_master');
        if (studyCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO study_master (study) VALUES ('10th'), ('12th'), ('UG'), ('DIPLOMA');`);
        }

        const [commCount] = await multiConnection.query('SELECT COUNT(*) as count FROM community_master');
        if (commCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO community_master (community) VALUES ('BC'), ('BCM'), ('MBC'), ('SC'), ('SCA'), ('ST'), ('OC'), ('Others');`);
        }

        const [typeCount] = await multiConnection.query('SELECT COUNT(*) as count FROM admission_type_master');
        if (typeCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO admission_type_master (admission_type) VALUES ('Government Quota'), ('Management Quota');`);
        }

        const [refCount] = await multiConnection.query('SELECT COUNT(*) as count FROM reference_type_master');
        if (refCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO reference_type_master (reference_type, way) VALUES ('Staff', 'Normal'), ('Student', 'Direct'), ('Alumni', 'Normal'), ('Agent', 'Normal'), ('Others', 'Normal');`);
        }

        const [statusCount] = await multiConnection.query('SELECT COUNT(*) as count FROM admission_status_master');
        if (statusCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO admission_status_master (admission_status) VALUES ('Enquiry'), ('Admitted'), ('Discontinue');`);
        }

        const [validDateCount] = await multiConnection.query('SELECT COUNT(*) as count FROM valid_date_master');
        if (validDateCount[0].count === 0) {
            await multiConnection.query(`INSERT INTO valid_date_master (date_count, archive_status) VALUES (30, 'Discontinue');`);
        }

        // Insert Admin User
        const [userCount] = await multiConnection.query('SELECT COUNT(*) as count FROM user_master WHERE user_id = "admin"');
        if (userCount[0].count === 0) {
            console.log("Creating default admin user...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@12345', salt);
            await multiConnection.query(`
                INSERT INTO user_master (user_role, user_id, password_hash)
                VALUES ('admin', 'admin', ?)
            `, [hashedPassword]);
            console.log("Admin user created: admin / Admin@12345");
        } else {
            console.log("Admin user already exists.");
        }

        console.log("Database initialized successfully!");
        await multiConnection.end();
        await connection.end();

    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

initDB();
