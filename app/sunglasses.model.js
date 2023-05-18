const state = require('./server')

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  readJSONFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, "utf8", (error, data) => {
        if(error) {
          reject(error)
        } else {
          resolve(JSON.parse(data));
        }
      })
    });
  };

  static getAllBrands() {
    return state.brands;
  }

  
}

module.exports = Sunglasses;