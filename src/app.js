require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/auth');
const { isAdmin } = require('./middleware/rbac');

// Import models to register associations
require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const contestRoutes = require('./routes/contests');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const topicRoutes = require('./routes/topics');
const adminTopicRoutes = require('./routes/admin/topics');
const adminProblemRoutes = require('./routes/admin/problems');
const adminContestRoutes = require('./routes/admin/contests');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);

// Authenticated routes
app.use('/api/submissions', submissionRoutes);

// Admin routes
app.use('/api/admin/topics', authenticate, isAdmin, adminTopicRoutes);
app.use('/api/admin/problems', authenticate, isAdmin, adminProblemRoutes);
app.use('/api/admin/contests', authenticate, isAdmin, adminContestRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`LAN access: http://<your-ip>:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
