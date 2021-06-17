"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateToken = exports.isTokenValid = exports.validateToken = void 0;
// token whitelist
let storage = [];
function validateToken(token) {
    storage.push(token);
}
exports.validateToken = validateToken;
function invalidateToken(token) {
    storage = storage.filter((tok) => tok !== token);
}
exports.invalidateToken = invalidateToken;
function isTokenValid(token) {
    return storage.includes(token);
}
exports.isTokenValid = isTokenValid;
//# sourceMappingURL=tokenValidation.js.map