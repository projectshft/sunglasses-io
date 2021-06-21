let Sunglasses = require("../models/sunglasses-io");

function getBrands(request, response) {
  response.send(Sunglasses.getBrands());
}

module.exports = { getBrands };
