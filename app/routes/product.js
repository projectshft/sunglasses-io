var fs = require('fs');

let products = [];
products = JSON.parse(fs.readFileSync("../../initial-data/products.json", "utf-8"));


const getProducts = () => {
    return products;
}
module.exports = { getProducts };