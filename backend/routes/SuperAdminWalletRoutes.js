const express = require('express');
const router = express.Router();
const {getAdminAllData} = require('../controllers/creditController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/fetch/:phoneNumber', authMiddleware,getAdminAllData );

module.exports = router;