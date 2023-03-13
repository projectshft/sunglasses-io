let brands = [{
  id: "1",
  name: "oakley"
}];

class Brands {
  constructor(params) {
    Object.assign(this, params)
  }

  static getAll() {
    return brands;
  }
};

module.exports = Brands;