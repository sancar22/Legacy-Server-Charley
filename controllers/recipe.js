const User = require("../models/user");


const deleteRecipe = async (req, res) => {
  const userId = req.body._id;
  const recipeId = req.body.id;

  try {
    await User.findByIdAndUpdate(userId,
      { $pull: { 'recipeStore': { id: recipeId } } },
      { new: true }
    );

    res.status(200).send('successfully deleted')

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

}


module.exports = { deleteRecipe };