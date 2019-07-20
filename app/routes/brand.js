var fs = require('fs');

let brands = [];
let products = [];
brands = JSON.parse(fs.readFileSync("../../initial-data/brands.json", "utf-8"));
products = JSON.parse(fs.readFileSync("../../initial-data/products.json", "utf-8"));

const getBrands = () => {
    return brands;
}

const getProducts = (brandId) => {
    return products.filter((product) => {
        return product.categoryId == brandId;
    })
}
module.exports = { getBrands, getProducts };