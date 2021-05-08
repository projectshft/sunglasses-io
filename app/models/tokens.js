let tokens = [];

class Token {
  constructor(params) {
    Object.assign(this,params);
  }

  static addToken(token) {
    tokens.push(token);
    return token;
  }

  static getAll() {
    return tokens;
  }
}

module.exports = Token;