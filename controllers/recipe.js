const User = require("../models/user");

const deleteRecipe = async (req, res) => {
  const userId = req.body._id;
  const recipeId = req.body.id;

  try {
    await User.findByIdAndUpdate(userId,
      { $pull: { 'recipeStore': { id: recipeId } } }
    );
    res.status(200).send('successfully deleted');

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}

const nameChange = async (req, res) => {
  const userId = req.body._id;
  const recipeId = req.body.id;

  try {
    await User.findOneAndUpdate(
      {_id: userId, recipeStore: {$elemMatch: {id: recipeId}}},
      {$set: {'recipeStore.$.name': req.body.name,}},
      {'new': true, 'safe': true, 'upsert': true}
    );
    res.status(200).send('successfully updated');

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

}




module.exports = { deleteRecipe, nameChange };