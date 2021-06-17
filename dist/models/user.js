<<<<<<< HEAD
"use strict";
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
module.exports = mongoose.model('User', userSchema);
=======
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const userSchema = index_1.default.Schema({
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
exports.default = index_1.default.model('User', userSchema);
>>>>>>> 63116252d4debc43c2d5f5c3e641253483e46be2
//# sourceMappingURL=user.js.map