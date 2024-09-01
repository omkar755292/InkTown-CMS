// uploadRoutes.js

const express = require('express');
const uploadController = require('../controllers/uploadController');
const router = express.Router();

// Endpoint for uploading top image
router.post('/top', uploadController.uploadTopImage);

// Endpoint for uploading bottom image
router.post('/bottom', uploadController.uploadBottomImage);

module.exports = router;
