const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// register api -> http://localhost:3000/api/auth/register/user
router.post('/register/user', authController.registeruser)

// login api -> http://localhost:3000/api/auth/login/user
router.post('/login/user',authController.loginuser)

module.exports = router
