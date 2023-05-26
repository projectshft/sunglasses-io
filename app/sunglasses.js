module.exports = class ShoppingCart {
  constructor(items = []) {
    this._items = items;
  }
  get subtotal() {
    return this._items.reduce((accumulatedSubtotal, items) => {
      return accumulatedSubtotal + items.quanity * items.price;  
    }, 0);
  }
};
