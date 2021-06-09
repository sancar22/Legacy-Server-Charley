const User = require('./../models/user');


const createUser = async (req, res) => {
  try {
    const newUser = await new User(req.body);
    newUser.save();
    res.status(200).json(newUser);

  } catch (e) {
    console.log(e)
    res.status(403).send(e);
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}

module.exports = { createUser, getAllUsers };