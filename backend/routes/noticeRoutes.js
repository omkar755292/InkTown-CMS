// Notice Routes.js 

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getNoticeData, SubmitNotice } = require('../controllers/noticController');
const router = express.Router();

// Fetch dashboard data
router.get('/fetch', authMiddleware, getNoticeData);
router.post('/post', authMiddleware, SubmitNotice);

module.exports = router;
