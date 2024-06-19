function checkCart(cart, productId) {
  // Is the item already in the cart?
  const matchingItem = cart.find(cartItem => cartItem.id === productId);
  return matchingItem;
}

function getCart(users, token) {
  const matchingUser = users.find(user = user.login.username === token.username);
  return matchingUser.cart;
}

function addCartItem(cart, item, quantity = 1) {
  item['quantity'] = quantity;
  cart.push(item);
  return cart;
}

function updateCartItem(cart, productId, quantity) {
  const matchingItem = cart.find(cartItem => cartItem.id === productId);
  matchingItem['quantity'] = quantity;
  return cart;
}

function deleteCartItem(cart, productId) {
  const matchingItem = cart.find(cartItem => cartItem.id === productId);
  const updatedCart = cart.filter(cartItem => cartItem !== matchingItem);
  return updatedCart;
}

module.exports = { checkCart, getCart, addCartItem, updateCartItem, deleteCartItem };