require('dotenv').config();

// ===== Core imports
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { initDB } = require('./config/connectiondb'); // tests MySQL on boot        // native (faster, needs build tools on some OS)

const authRoutes = require('./routes/authRoute');
const studentRoutes = require('./routes/studentRoute');
const evaluatorRoutes = require('./routes/evaluatorRoute');
const adminRoutes = require('./routes/adminRoute');

// ===== App & basic config
const app = express();
const PORT = process.env.PORT || 5000;

// ===== Security & performance middleware
app.use(helmet());             // sets secure HTTP headers
app.use(compression());        // gzip responses
app.use(cors({ origin: true, credentials: true })); // adjust origin in production
app.use(morgan('dev'));        // request logs
app.use(cookieParser());       // read cookies


// ===== Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

initDB();

app.get('/api/health', (req,res)=> res.json({status:'ok', at:new Date().toISOString()}));

app.use('/api', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/evaluator', evaluatorRoutes);
app.use('/api/admin', adminRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server is starting on: http://localhost:${PORT}`);
});