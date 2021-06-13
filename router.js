const express = require('express');
const router = express.Router();
const userController = require('./controllers/users');
const recipeScrapingController = require('./controllers/recipeScraper');
const recipeController = require('./controllers/recipe');
const authMiddleware = require('./middlewares/auth');

router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.get('/profile', authMiddleware, userController.profile);
router.get('/users', userController.getAllUsers);

router.post('/scrape', authMiddleware, recipeScrapingController.handleScrape);
router.post('/deleteRecipe', authMiddleware, recipeController.deleteRecipe);
router.post('/nameChange', authMiddleware, recipeController.nameChange);
router.post('/addNote', authMiddleware, recipeController.addNote);


module.exports = router;