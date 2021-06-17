'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jwt = require('jsonwebtoken');
const { isTokenValid } = require('./tokenValidation.ts');
const { SECRET_KEY } = process.env;
const authMiddleware = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      // get token
      const authHeaders = req.headers.authorization;
      if (!authHeaders) return res.sendStatus(403);
      const token = authHeaders.split(' ')[1];
      if (!isTokenValid(token)) {
        throw new Error('invalid token');
      }
      let tokenData = jwt.verify(token, SECRET_KEY);
      req.body._id = tokenData._id;
      next();
    } catch (e) {
      res.status(401).end('You need to be logged in first');
    }
  });
module.exports = authMiddleware;
