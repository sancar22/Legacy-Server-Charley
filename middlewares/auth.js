const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { isTokenValid } = require('./tokenValidation');
const SECRET_KEY = process.env.SECRET_KEY;


const authMiddleware = async (req, res, next) => {
  try {

    // get token
    const authHeaders = req.headers['authorization'];
    if (!authHeaders) return res.sendStatus(403);
    const token = authHeaders.split(' ')[1];


    if (!isTokenValid(token)) {
      throw new Error('invalid token');
    }

    // find user
    const { _id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ _id });
    if (!user) return res.sendStatus(401);
    req.body.user = user;

    next();

  } catch (e) {
    res.status(401).end('You need to be logged in first');
  }

}

module.exports = authMiddleware;