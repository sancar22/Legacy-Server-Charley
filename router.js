const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const authMiddleware = require('./middlewares/auth');

router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.get('/users', userController.getAllUsers);

module.exports = router;