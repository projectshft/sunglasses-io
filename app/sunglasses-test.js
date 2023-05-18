let { expect } = require("chai");
let ShoppingCart = require("./sunglasses");

describe("The shopping cart", () => {
  describe("Subtotal should be", () => {
    it("0 if no items are added", () => {
      //arrage
      let shoppingCart = new ShoppingCart();
      //act
      let subtotal = shoppingCart.subtotal;
      //assert
      expect(subtotal).to.equal(0);
    });

    it("the sum of all items price * quantity for all items", () => {
      let shopping = new ShoppingCart([
        {
          id: 1,
          quantity: 5,
          price: 5,
        },
        {
          id: 2,
          quantity: 4,
          price: 5,
        },
        {
          id: 3,
          quantity: 1,
          price: 50,
        },
      ]);
      expect(subtotal).to.equal(95);
    });
  });
});
