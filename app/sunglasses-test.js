const app = require("./server");
let { expect } = require("chai");
let ShoppingCart = require("./sunglasses");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./server");
let should = chai.should();
chai.use(chaiHttp);

describe("Sunglasses API", () => {
  describe("GET /sunglasses", () => {
    it("should return an array of sunglasses", (done) => {
      chai
        .request(app)
        .get("/sunglasses")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an("array");
          res.body.forEach((sunglasses) => {
            expect(sunglasses).to.have.property("name");
            expect(sunglasses).to.have.property("brand");
          });
          done();
        });
    });
  });
});

describe("Individual sunglasses info", () => {
  describe("GET /sunglasses/brand/:itemId", () => {
    it("should return an object of detaild of the sunglasses return", (done) => {
      chai
        .request(app)
        .get("/sunglasses/")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.an("object");
          expect(res).to.be.json;
          done();
        });
    });
  });
});

describe("login call", () => {
  describe("POST /sunglasses/login", () => {
    it("should check if an account exists", (done) => {
      chai
        .request(app)
        .post("/sunglasses/login")
        .send({
          username: "John1",
          password: "56789",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res).to.be.an("object");
          expect(res).to.be.json;
          done();
        });
    });
  });
});

// describe("User profile", () => {
//   describe("GET /sunglasses/me");
//   it("should return a user profile", (done) => {
//     chai
//       .request(app)
//       .get("/sunglasses/me")
//       .end((err, res) => {
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect(res).to.be.an("array");
//         expect();
//       });
//   });
// });

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
});

describe("Show shopping cart ", () => {
  describe("GET /sunglasses/me/cart", () => {
    it("should return an array of sunglasses in the showing cart", (done) => {
      chai
        .request(app)
        .get("/sunglasses/me/cart")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.an("array");
          expect(res).to.be.json;
          done();
        });
    });
  });
});

describe("Add item to shopping cart", () => {
  describe("POST /sunglasses/me/add", () => {
    it("should add an item to the cart", (done) => {
      const newItem = {
        brand: "Some Brand",
        name: "Some Name",
      };

      chai
        .request(app)
        .post("/sunglasses/me/add")
        .send(newItem)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res).to.be.an("object");
          expect(res).to.be.json;
          done();
        });
    });
  });
});

describe("Delete item from shopping cart", () => {
  describe("DELETE /sunglasses/me/cart/delete", () => {
    it("should delete an item from cart", (done) => {
      chai
        .request(app)
        .delete("/sunglasses/me/cart/delete")
        .end((err, res) => {
          expect(err).to.have.status(404);
          expect(res).to.have.status(201);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Item deleted successfully");
        });
    });
  });
});
