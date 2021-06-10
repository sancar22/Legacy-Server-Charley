// token whitelist
let storage = [];


function validateToken (token) {
  storage.push(token);
}

function invalidateToken (token) {
  storage = storage.filter(tok => tok !== token);
}

function isTokenValid (token) {
  return storage.includes(token);
}

module.exports = {
  validateToken, isTokenValid, invalidateToken
};