/**
 * SchoolHub Pro Backend
 * Copyright (c) 2024-2026 Yvan Zamorano. All rights reserved.
 * Licensed under MIT License
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:4028', 'http://localhost:3000'];
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SchoolHub Pro API Documentation',
}));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/students.routes'));
app.use('/api/teachers', require('./routes/teachers.routes'));
app.use('/api/parents', require('./routes/parents.routes'));
app.use('/api/admins', require('./routes/admins.routes'));
app.use('/api/classes', require('./routes/classes.routes'));
app.use('/api/sections', require('./routes/sections.routes'));
app.use('/api/subjects', require('./routes/subjects.routes'));
app.use('/api/exams', require('./routes/exams.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/fee-types', require('./routes/feeTypes.routes'));
app.use('/api/student-fees', require('./routes/studentFees.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/notices', require('./routes/notices.routes'));
app.use('/api/academic-years', require('./routes/academicYears.routes'));
app.use('/api/semesters', require('./routes/semesters.routes'));
app.use('/api/grade-scale', require('./routes/gradeScale.routes'));
app.use('/api/materials', require('./routes/materials.routes'));
app.use('/api/timetables', require('./routes/timetables.routes'));
app.use('/api/report-cards', require('./routes/reportCards.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SchoolHub Pro API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
