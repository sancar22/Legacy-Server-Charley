const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { DB_CONN } = process.env;

mongoose.connect(
   DB_CONN,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(`😞 can't connet to db, something went wrong! ${err}`);
    } else {
      console.log(`🦆 Database connected!`);
    }
  }
);

module.exports = mongoose;