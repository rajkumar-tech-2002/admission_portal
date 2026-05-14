const express = require('express');
const cors = require('cors');

const path = require('path');

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all to serve React's index.html for non-API requests
app.use((req, res, next) => {
    // Skip if it's an API request
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Only serve index.html for GET requests
    if (req.method === 'GET') {
        return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
    next();
});

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
