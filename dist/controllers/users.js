"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const tokenValidation_1 = require("../middlewares/tokenValidation");
const SECRET_KEY = process.env.SECRET_KEY;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username } = req.body;
        if (!(email && password && username)) {
            return res.status(400).send('invalid request');
        }
        if (yield user_1.default.findOne({ email }).exec()) {
            return res.status(403).send('user already exists!');
        }
        if (yield user_1.default.findOne({ username }).exec()) {
            return res.status(409).send('this username is taken');
        }
        // create user
        const hashedPassword = bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(10));
        const newUser = yield new user_1.default({
            email,
            password: hashedPassword,
            username,
        });
        newUser.save();
        // send back access token
        let token = jsonwebtoken_1.default.sign({ _id: newUser._id }, SECRET_KEY, { expiresIn: '3h' });
        tokenValidation_1.validateToken(token);
        res.status(201).json({ accessToken: token });
    }
    catch (e) {
        console.log(e);
        res.status(403).send(e);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).end('username and password are required');
    }
    let user = yield user_1.default.findOne({ email }).exec();
    if (!user || !bcrypt_1.default.compareSync(password, user.password)) {
        return res.status(403).end('invalid username or password');
    }
    // send back access token
    let token = jsonwebtoken_1.default.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '3h' });
    tokenValidation_1.validateToken(token);
    res.status(200).json({ accessToken: token });
});
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.body._id);
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.sendStatus(400);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    tokenValidation_1.invalidateToken(token);
    res.status(200).send('logout successful');
});
const getAllButMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.find();
        const allButMe = users.filter((user) => user.id !== req.body._id);
        const usernames = allButMe.map((user) => user.username);
        res.status(200).json(usernames);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});
const getFriendStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ username: req.body.username });
        if (user) {
            res.status(200).json(user.recipeStore);
        }
        else {
            throw new Error('user not found');
        }
    }
    catch (e) {
        res.status(400).send(e);
    }
});
const userController = {
    createUser,
    getAllButMe,
    login,
    logout,
    profile,
    getFriendStore,
};
exports.default = userController;
//# sourceMappingURL=users.js.map