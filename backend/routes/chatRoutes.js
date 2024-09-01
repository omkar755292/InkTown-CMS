// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/sendMessage', authMiddleware,chatController.sendMessage);
router.post('/getMessage', authMiddleware, chatController.getMessage);

module.exports = router;
