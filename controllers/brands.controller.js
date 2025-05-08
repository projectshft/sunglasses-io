const products = require("../models/products.json");
const brands = require("../models/brands.json");

const getBrands = (req, res) => {
  try {
    res.status(200).json({ brands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandProducts = (req, res) => {
  try {
    const { brandId } = req.params;
    const brandedProducts = products.filter((product) =>
      String(product.brandId === String(brandId))
    );

    res.status(200).json({ products: brandedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBrands, getBrandProducts };
