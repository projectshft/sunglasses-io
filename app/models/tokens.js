let tokens = [];

class Token {
  constructor(params) {
    Object.assign(this,params);
  }

  static addToken(token) {
    tokens.push(token);
    return token;
  }

  static getToken(accessToken) {
    return tokens.find((token=>token.accessToken == accessToken))
  }

  static getAll() {
    return tokens;
  }

  static removeAll() {
    tokens = [];
  }
}

module.exports = Token;