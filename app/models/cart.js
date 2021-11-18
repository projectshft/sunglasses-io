const fs = require('fs')

fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length} products loaded`);
});

class Cart {
  constructor(params) {
    Object.assign(this,params);
  }

  static getProdFromId(id) {
    // id is stored in 'product.id'
    let matched;
    const checkId = (id => {
      products.filter(function(p) {
        if (p.id !== id) {
          return false;
        } return true;
      }).map((p) => {
        matched = p;
        return p;
      })
      return matched;
    })
    return checkId(id);
  };

}
module.exports = Cart;
