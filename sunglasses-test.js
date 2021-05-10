let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./app/server");
const { expect } = require("chai");
const { uid } = require("rand-token");

let should = chai.should();

chai.use(chaiHttp);

describe("brands", () => {
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  describe("/GET brands/:brandId/products", () => {
    it("should return the products of a brand", (done) => {
      chai
        .request(server)
        .get("/brands/:brandId/products")
        .end((err, res) => {
          //res.should.have.status(200);
          res.body.should.be.an("object");
          done();
        });
      });
    });
  });
});

describe("products", () => {
  describe("/GET products", () => {
    it("should return all the products", (done) => {
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

describe("User", () => {
  describe("/POST login", () => {
    it("should return access token for user to log in", (done) => {
      let userLogin = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }
      chai
        .request(server)
        .post("/login")
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        });
    });
    it("should return error if username or password is missing", (done) => {
      let userLogin = {
        username: '',
        password: 'jonjon'
      }
      chai
        .request(server)
        .post("/login")
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("should return error if username or password is wrong", (done) => {
      let userLogin = {
        username: 'yellowleopard753',
        password: 'cheeseburger'
      }
      chai
        .request(server)
        .post("/login")
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    describe("/GET me/cart", () => {
      it("should return the cart", (done) => {
        let cart = [{
          token: uid(16),
          items: [{
            brandId: 1,
            quantity: 3,
          }]
        }]
        chai
          .request(server)
          .get("/me/cart")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
        });
      });
      it("should not return the cart if there is no token", (done) => {
        let cart = [
          items = [{
            brandId: 1,
            quantity: 3,
          }]
        ]
        chai
          .request(server)
          .get("/me/cart")
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            done();
        });
      });
      describe("/POST me/cart", () => {
        it("should add a product to the cart", (done) => {
          let product = {
            id: 1,
            brandId: 1,
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150
          }
          chai
            .request(server)
            .post("/me/cart")
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('id');
              res.body.should.have.property('brandId');
              res.body.should.have.property('name');
              res.body.should.have.property('description');
              res.body.should.have.property('price');
              done();
          });
        });
      });
    });
    describe("/DELETE me/cart/:id", () => {
      it("should remove a product from the cart", (done) => {
        let cart = [{
          token: uid(16),
          items: [{
            brandId: 1,
            quantity: 3,
          }]
        }]
        chai
          .request(server)
          .delete("/me/cart/:id")
          .end((err, res) => {
            res.should.have.status(200);
            done();
        });
      });
    });
    describe("/POST me/cart/:id", () => {
      it("should update quantity of product in cart", (done) => {
        let cart = [{
          token: uid(16),
          items: [{
            brandId: 1,
            quantity: 3,
          }]
        }]
        let newCart = [{
          token: uid(16),
          items: [{
            brandId: 1,
            quantity: 2,
          }]
        }]
        chai
          .request(server)
          .post("/me/cart/:id")
          .send(newCart)
          .end((err, res) => {
            res.should.have.status(200);
            done();
        });
      });
    });
  });
});
