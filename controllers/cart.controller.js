const users = require("../models/users.json");
const products = require("../models/products.json");

const getCart = (req, res) => {
  try {
    const user = users.find((user) => user.email === req.user.email);
    if (!user) return res.status(404).json({ message: "user does not exist" });
    res.status(200).json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ message: "product ID is required" });

    const user = users.find((user) => user.email === req.user.email);
    if (!user) return res.status(404).json({ message: "user does not exist" });

    const product = products.find(
      (product) => String(product.id) === String(productId)
    );
    if (!product) return res.status(400).json({ message: "product not found" });

    const productToAdd = user.cart.find(
      (product) => String(product.productId) === String(productId)
    );

    if (productToAdd) {
      productToAdd.quantity += 1;
    } else {
      user.cart.push({
        productId: product.id,
        item: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    res.status(200).json({ message: "added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = (req, res) => {
  try {
    const { productId } = req.params;

    const user = users.find((user) => user.email === req.user.email);
    if (!user) return res.status(404).json({ message: "user does not exist" });

    const productInCart = user.cart.some(
      (product) => String(product.productId) === String(productId)
    );
    if (!productInCart) {
      return res.status(404).json({ message: "product not found" });
    }

    user.cart = user.cart.filter(
      (product) => String(product.productId) !== String(productId)
    );
    res.status(200).json({ message: "removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductQuant = (req, res) => {
  try {
    const { productId } = req.params;
    const user = users.find((user) => user.email === req.user.email);
    if (!user) return res.status(404).json({ message: "user does not exist" });

    const product = products.find(
      (product) => String(product.id) === String(productId)
    );
    if (!product) return res.status(404).json({ message: "product not found" });

    const productInCart = user.cart.find(
      (product) => String(product.productId) === String(productId)
    );
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      user.cart.push({
        productId: product.id,
        item: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    res.status(200).json({ message: "cart updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateProductQuant };
