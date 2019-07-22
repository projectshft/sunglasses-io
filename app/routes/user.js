//Separated routes trying to improve readability in the server.js file
var fs = require("fs");
let users = [];

users = JSON.parse(fs.readFileSync("../../initial-data/users.json", "utf-8"));

// Function to return all of the users
const getUsers = () => {
  return users;
};

//Function to find a user by email
const findUserByEmail = email => {
  return users.find(user => {
    return user.email == email;
  });
};

//Function to add a cart item to a user's cart
const addItemToCart = (user, productId) => {
  const cartId = user.cart.length;
  let cartItem = {
    cartId: cartId,
    productId: productId,
    quantity: 1
  };
  user.cart.push(cartItem);
  return user.cart;
};

//Function to change the quantity of an existing cart item
const changeQuantityOfCartItem = (user, cartId, quantity) => {
  let currentItem = user.cart.find(item => {
    return item.cartId == cartId || null;
  });
  if (currentItem) {
    currentItem.quantity = quantity;
  }
  return currentItem;
};

//Function to remove an item from the user's cart
const deleteCartItem = (user, cartId) => {
  let currentItem = user.cart.find(item => {
    return item.cartId == cartId;
  });
  user.cart.splice(currentItem, 1);
  return user.cart;
};

module.exports = {
  getUsers,
  findUserByEmail,
  addItemToCart,
  changeQuantityOfCartItem,
  deleteCartItem
};
