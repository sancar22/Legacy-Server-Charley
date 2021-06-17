const User = require('../models/user');
import { EditOptions, Recipe } from '../lib/index';
import { Request, Response } from 'express';

const deleteRecipe = async (req: Request, res: Response) => {
  const userId: string = req.body._id;
  const recipeId: string = req.params.recipeId;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { recipeStore: { id: recipeId } },
    });
    res.status(200).send('successfully deleted');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const addFromFriend = async (req: Request, res: Response) => {
  const userId: string = req.body._id;
  const recipe: Recipe = req.body.recipe;

  try {
    await User.findByIdAndUpdate(userId, { $push: { recipeStore: recipe } });
    res.status(204).send('success');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const editRecipe = async (req: Request, res: Response) => {
  const userId: string = req.body._id;
  const recipeId: string = req.body.id;
  const editAction: string = req.params.editAction;
  const payload: string = req.body.payload;

  let options: EditOptions = {
    nameChange: { $set: { 'recipeStore.$.name': payload } },
    addNote: { $push: { 'recipeStore.$.notes': payload } },
    deleteNote: { $pull: { 'recipeStore.$.notes': { id: payload } } },
  };

  try {
    await User.findOneAndUpdate(
      { _id: userId, recipeStore: { $elemMatch: { id: recipeId } } },
      options[editAction],
      { new: true, safe: true }
    );
    res.status(200).send('successfully updated');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

module.exports = { deleteRecipe, addFromFriend, editRecipe };
