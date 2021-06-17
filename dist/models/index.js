<<<<<<< HEAD
"use strict";
const mongoose = require('mongoose');
const { DB_CONN } = process.env;
mongoose.connect(DB_CONN, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(`😞 can't connect to db, something went wrong! ${err}`);
    }
    else {
        console.log(`🦆 database connected!`);
    }
});
module.exports = mongoose;
=======
"use strict";
const mongoose = require('mongoose');
const { DB_CONN } = process.env;
mongoose.connect(DB_CONN, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(`😞 can't connect to db, something went wrong! ${err}`);
    }
    else {
        console.log(`🦆 database connected!`);
    }
});
module.exports = mongoose;
>>>>>>> 63116252d4debc43c2d5f5c3e641253483e46be2
//# sourceMappingURL=index.js.map