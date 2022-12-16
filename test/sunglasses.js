let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server.js");

let should = chai.should();

chai.use(chaiHttp);

describe("Glasses", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("login", () => {
  describe("/POST login", () => {
    it("it should log in the user and start a new session", (done) => {
      let username = { username: "yellowleopard753" };
      chai
        .request(server)
        .post(`/login`)
        .send(username)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          done();
        });
    });
    it("it should return an error if user login fails", (done) => {
      let username = "invalid";
      chai
        .request(server)
        .post(`/login`)
        .send(username)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("User", () => {
  let token = "a8be2a69c8c91684588f4e1a29442dd7";
  describe("/GET cart", () => {
    it("it should GET all cart items", (done) => {
      chai
        .request(server)
        .get("/me/cart")
        .set("auth", token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should return an error that the user is not logged in", (done) => {
      chai
        .request(server)
        .get("/me/cart")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe("/POST cart", () => {
    it("it should POST a new item", (done) => {
      let pair = {
        quantity: 1,
        pair: {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price: 150,
          imageUrls: [
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          ],
        },
      };
      chai
        .request(server)
        .post(`/me/cart`)
        .set("auth", token)
        .send(pair)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should return an error that the user is not logged in", (done) => {
      let pair = {
        quantity: 1,
        pair: {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price: 150,
          imageUrls: [
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          ],
        },
      };
      chai
        .request(server)
        .post(`/me/cart`)
        .send(pair)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe("/PUT cart", () => {
    it("it should EDIT the amount of this item in the cart", (done) => {
      let cartItem = {
        quantity: 2,
        pair: {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price: 150,
          imageUrls: [
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          ],
        },
      };
      chai
        .request(server)
        .put(`/me/cart/1`)
        .set("auth", token)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should return an error that the user is not logged in", (done) => {
      let cartItem = {
        quantity: 2,
        pair: {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price: 150,
          imageUrls: [
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          ],
        },
      };
      chai
        .request(server)
        .put("/me/cart/1")
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe("/DELETE cart item", () => {
    it("it should DELETE the pair from the cart", (done) => {
      chai
        .request(server)
        .del(`/me/cart/1`)
        .set("auth", token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should return an error that the user is not logged in", (done) => {
      chai
        .request(server)
        .del("/me/cart/1")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/GET brands/:id/products", () => {
    it("it should GET all the products of the brand", (done) => {
      chai
        .request(server)
        .get("/brands/2/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});
