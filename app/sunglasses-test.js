let { expect } = require("chai");
let ShoppingCart = require("./sunglasses");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./server");
//?
let should = chai.should();
//?
chai.use(chaiHttp);

const baseUrl = "https://api.sunglasses.com/v1";

describe("Sunglasses API ", () => {
  describe("GET /sunglasses", () => {
    it("should return an array of sunglasses", (done) => {
      chai
        .request(baseUrl)
        .get("/sunglasses")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.an("array");
          expect(res).to.be.json;
          done();
        });
    });
  });

  describe("GET /me", () => {
    it("should return a user profile", (done) => {
      chai
        .request(baseUrl)
        .get("/me")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.an("array");
          expect();
        });
    });
  });

  describe("the shopping cart", () => {
    describe("the items in the shopping cart", () => {
      it("return the items added to the cart", () => {
        let shoppingCart = new ShoppingCart([
          {
            id: 1,
            quantity: 4,
            price: 50,
          },
        ]);

        let item = {
          id: 2,
          quantity: 2,
          price: 30,
        };

        let addedItem = shoppingCart.add(item); 
        expect(addedItem).to.equal(item); 
      });
    });
    describe("total should be", () => {
      it("0 if no items are passes in ", () => {
        let shoppingCart = new ShoppingCart();
        let subtotal = shoppingCart.subtotal;
        expect(subtotal).to.equal(0);
      });

      it("the sum of price * quantity for all items", () => {
        let shoppingCart = new ShoppingCart([
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
        ]);
        expect(shoppingCart.subtotal).to.equal(45);
      });
    });
  });
});
