const express = require('express');
const { isAuth } = require('../middlewares/isAuth');
const { getDashboardData } = require('../controllers/dashboard');
const router = express.Router();

router.get("/",isAuth,getDashboardData);

module.exports = router;