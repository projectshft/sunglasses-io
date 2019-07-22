//Separated routes trying to improve readability in the server.js file
var fs = require("fs");

let brands = [];
brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

// function logic for the api/brands route
const getBrands = () => {
  return brands;
};

module.exports = { getBrands };
