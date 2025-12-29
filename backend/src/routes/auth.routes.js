const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// register api -> http://localhost:3000/api/auth/register/user
router.post('/register/user', authController.registeruser)

// login api -> http://localhost:3000/api/auth/login/user
router.post('/login/user', authController.loginuser)

// Forgot Pass -> http://localhost:3000/api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword)

// Reset Pass -> http://localhost:3000/api/auth/reset-password
router.post('/reset-password', authController.resetPassword)

module.exports = router