const express = require('express');
const router = express.Router();
const userController = require('./controllers/users');
const recipeScrapingController = require('./controllers/recipeScraper');
const authMiddleware = require('./middlewares/auth');

router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.get('/profile', authMiddleware, userController.profile);
router.get('/users', userController.getAllUsers);

router.post('/scrape', recipeScrapingController.scrape);


module.exports = router;