// dashboardRoutes.js

const express = require('express');
const router = express.Router();
const {addCredit,getAllData,getCashbackWallet} = require('../controllers/creditController');
const authMiddleware = require('../middlewares/authMiddleware');

// Fetch dashboard data
router.get('/fetch', authMiddleware,getAllData );
// router.get('/fetchWallet', authMiddleware,getAllDataWallet);
router.post('/add', authMiddleware,addCredit);

router.get('/CashbackWallet', authMiddleware,getCashbackWallet);

module.exports = router;


