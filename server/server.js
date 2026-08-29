const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const { router: authRoutes, seedDefaultAdmin } = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const callRoutes = require('./routes/callRoutes');
const updateRoutes = require('./routes/updateRoutes');
const reportRoutes = require('./routes/reportRoutes');
const workLogRoutes = require('./routes/workLogRoutes');
const { router: categoryRoutes, seedCategories } = require('./routes/categoryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Bulletproof CORS configuration for Render & Vercel deployment
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically mirror incoming origin to allow Vercel, localhost, and custom domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/worklogs', workLogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Team Manager API Server is running smoothly' });
});

const PORT = process.env.PORT || 5000;

// Start DB and Server
connectDB().then(async () => {
  await seedDefaultAdmin();
  await seedCategories();
  app.listen(PORT, () => {
    console.log(`[Server] Team Manager API listening on http://localhost:${PORT}`);
  });
});
