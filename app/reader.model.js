const fs = require('fs');

class Reader {
  constructor(params) {
    Object.assign(this, params);
  }

  static readJSONFile(fileName) {
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
  
};

module.exports = Reader