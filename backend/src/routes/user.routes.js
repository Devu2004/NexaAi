const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.get('/profile', authMiddleware.authuser, userController.getUserProfile);


router.put('/update-profile', authMiddleware.authuser, userController.updateProfile);

module.exports = router;