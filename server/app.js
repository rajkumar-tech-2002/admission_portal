const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const masterRoutes = require('./routes/master.routes');
const recordRoutes = require('./routes/record.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/records', recordRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ 
        success: false, 
        message: statusCode === 500 ? 'Something went wrong!' : err.message,
        error: err.message 
    });
});

module.exports = app;
