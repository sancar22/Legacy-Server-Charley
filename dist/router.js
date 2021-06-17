"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./controllers/users"));
const recipeScraper_ts_1 = __importDefault(require("./controllers/recipeScraper.ts"));
const recipe_1 = __importDefault(require("./controllers/recipe"));
const auth_1 = __importDefault(require("./middlewares/auth"));
const router = express_1.default.Router();
router.post('/signup', users_1.default.createUser);
router.post('/login', users_1.default.login);
router.get('/logout', auth_1.default, users_1.default.logout);
router.get('/profile', auth_1.default, users_1.default.profile);
router.get('/users', auth_1.default, users_1.default.getAllButMe);
router.post('/getFriendStore', auth_1.default, users_1.default.getFriendStore);
router.post('/scrape', auth_1.default, recipeScraper_ts_1.default.handleScrape);
router.post('/deleteRecipe/:recipeId', auth_1.default, recipe_1.default.deleteRecipe);
router.post('/addFromFriend', auth_1.default, recipe_1.default.addFromFriend);
router.post('/editRecipe/:editAction', auth_1.default, recipe_1.default.editRecipe);
exports.default = router;
//# sourceMappingURL=router.js.map