module.exports = class Brands{
  constructor(brand = []) {
    this._brand = brand;
  }
  get length() {
    return this._brand.map((brands) => {
      return brands.brand }, 0);
}
};