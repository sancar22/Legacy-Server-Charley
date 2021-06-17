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
const User = require('../models/user');
const deleteRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body._id;
    const recipeId = req.params.recipeId;
    try {
        yield User.findByIdAndUpdate(userId, {
            $pull: { recipeStore: { id: recipeId } },
        });
        res.status(200).send('successfully deleted');
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});
const addFromFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body._id;
    const { recipe } = req.body;
    try {
        yield User.findByIdAndUpdate(userId, { $push: { recipeStore: recipe } });
        res.status(204).send('success');
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});
const editRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body._id;
    const recipeId = req.body.id;
    const editAction = req.params.editAction;
    const payload = req.body.payload;
    let options = {
        nameChange: { $set: { 'recipeStore.$.name': payload } },
        addNote: { $push: { 'recipeStore.$.notes': payload } },
        deleteNote: { $pull: { 'recipeStore.$.notes': { id: payload } } },
    };
    try {
        yield User.findOneAndUpdate({ _id: userId, recipeStore: { $elemMatch: { id: recipeId } } }, options[editAction], { new: true, safe: true });
        res.status(200).send('successfully updated');
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});
module.exports = { deleteRecipe, addFromFriend, editRecipe };
//# sourceMappingURL=recipe.js.map