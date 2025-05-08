const productsModel = require("../models/products.json");

const getProducts = (req, res) => {
  try {
    res.status(200).json({ products: productsModel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByBrand = (req, res) => {
  try {
    const { brandId } = req.params;
    const filteredProducts = productsModel.filter(
      (product) => product.brandId === brandId
    );
    res.status(200).json({ products: filteredProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductsByBrand };
