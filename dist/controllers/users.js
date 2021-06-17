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
Object.defineProperty(exports, "__esModule", { value: true });
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateToken, invalidateToken, } = require('../middlewares/tokenValidation');
const SECRET_KEY = process.env.SECRET_KEY;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username } = req.body;
        if (!(email && password && username)) {
            return res.status(400).send('invalid request');
        }
        if (yield User.findOne({ email }).exec()) {
            return res.status(403).send('user already exists!');
        }
        if (yield User.findOne({ username }).exec()) {
            return res.status(409).send('this username is taken');
        }
        // create user
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newUser = yield new User({
            email,
            password: hashedPassword,
            username,
        });
        newUser.save();
        // send back access token
        let token = jwt.sign({ _id: newUser._id }, SECRET_KEY, {
            expiresIn: '3h',
        });
        validateToken(token);
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
    let user = yield User.findOne({ email }).exec();
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(403).end('invalid username or password');
    }
    // send back access token
    let token = jwt.sign({ _id: user._id }, SECRET_KEY, {
        expiresIn: '3h',
    });
    validateToken(token);
    res.status(200).json({ accessToken: token });
});
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(req.body._id);
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.sendStatus(400);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
    invalidateToken(token);
    res.status(200).send('logout successful');
});
const getAllButMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allButMe = yield User.find({
            _id: { $nin: [ObjectID(req.body._id)] },
        }).select('username -_id');
        const usernames = allButMe.map((otherUser) => otherUser.username);
        res.status(200).json(usernames);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});
const getFriendStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({
            username: req.body.username,
        });
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
module.exports = {
    createUser,
    getAllButMe,
    login,
    logout,
    profile,
    getFriendStore,
};
//# sourceMappingURL=users.js.map