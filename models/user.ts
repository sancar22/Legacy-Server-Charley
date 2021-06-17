/* @ts-ignore */
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  recipeStore: {
    type: Array,
    required: false,
    default: [],
  },
});

export default mongoose.model('User', userSchema);
