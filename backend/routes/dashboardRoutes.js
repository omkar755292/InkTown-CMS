// dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Fetch dashboard data
router.get('/user/dashboard', authMiddleware, dashboardController.fetchDashboard);

module.exports = router;
