// token whitelist
let storage: string[] = [];

function validateToken(token: string) {
  storage.push(token);
}

function invalidateToken(token: string) {
  storage = storage.filter((tok: string) => tok !== token);
}

function isTokenValid(token: string) {
  return storage.includes(token);
}

module.exports = {
  validateToken,
  isTokenValid,
  invalidateToken,
};
