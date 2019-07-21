//Separated routes trying to improve readability in the server.js file
var fs = require("fs");

let products = [];
products = JSON.parse(
  fs.readFileSync("../../initial-data/products.json", "utf-8")
);

//function that takes care of both the /api/brands/:id/products route when
//an argument is provided (returning only the products that match the categoryId)
// and the /api/products route when no argument is provided (returning all products)
const getProducts = category => {
  if (category) {
    return products.filter(product => {
      return product.categoryId == category;
    });
  } else {
    return products;
  }
};
module.exports = { getProducts };
