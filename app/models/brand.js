let brands = [];
let currentId = 1;

class Brand  {
  constructor(params) {
    Object.assign(this, params);
  }

  static getAll() {
    return brands
  }

  static removeAll() {
    brands = [];
  }

} 

//Exports the Brand for use elsewhere.
module.exports = Brand;