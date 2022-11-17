let cart = [];
let itemId = 1;
let itemQuantity = 1;

class Cart {
  constructor(params) {
    Object.assign(this, params)
  }
  
  static addToCart(newItem) { 
    newItem.id = itemId;
    itemId++;
    newItem.itemQuantity = itemQuantity  
    cart.push(newItem)
    return newItem; 
  }

   static removeFromCart(itemIdToRemove) {
    cart = cart.filter((item=>item.itemId != itemIdToRemove))
  }

  // static getItem(itemId) {
  //   return cart.find((item=>item.itemId == itemId))
  // }

  static getAll() {
    return cart
  }

  static updateCart(updatedQuantity) {
    let item = cart.find((item=>item.itemQuantity == updatedQuantity))
    Object.assign(item, updatedQuantity);
    return item;
  } 
}

module.exports = Cart;
