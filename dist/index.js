"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const router_1 = __importDefault(require("./router"));
const { PORT } = process.env;
const app = express_1.default();
app
    .use(morgan_1.default('dev'))
    .use(cors_1.default())
    .use(express_1.default.json())
    .use(router_1.default)
    .get('/', (_, res) => {
    res.status(200).send('Hello, stranger!');
})
    .get('*', (_, res) => {
    res.status(404).send('Sorry, not found 😞');
})
    .listen(PORT, () => {
    console.log(`🚀 server listening on port: ${PORT}`);
});
//# sourceMappingURL=index.js.map