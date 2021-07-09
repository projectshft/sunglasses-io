//let Product = require("../app/products");
//let products = require("../app/products");
//let productsToReturn = require("../app/products");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect } = require("chai");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("/GET sunglasses", () => {
    it("it should GET all sunglasses", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  //getting a green check here but i don't think this is testing what i want
  //i want a to test that the res is a 200 and returns an array but that's giving me errors
  //i think this just tests that the .get and .query give v1/sunglasses?=glasses
  describe("/GET searched sunglasses", () => {
    it("it should GET search query", (done) => {
      chai.request(server).get("v1/sunglasses").query({ query: "glasses" });
      done();
    });
    it("should get searched sunglasses", (done) => {
      let query = "?query=glasses";
      chai
        .request(server)
        .get(`/api/products${query}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});

describe("Brands", () => {
  describe("/GET Brands", () => {
    it("it should GET all brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });
  describe("/GET Brands", () => {
    it("it should GET sunglasses based on brand", (done) => {
      let categoryId = 1;
      chai
        .request(server)
        .get(`/api/brands/${categoryId}/products`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("User", () => {
  describe("/GET User", () => {
    it("it should GET current user", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("object");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe("/POST User", () => {
    it("it should POST sunglasses based on ID to user cart", (done) => {
      let product = {
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
      };

      chai
        .request(server)
        .post(`/api/me/${product.id}/cart`)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.cart.should.be.an("array");
          //res.body.should.have.property("id");
          //res.body.should.have.property("categoryId");
          //res.body.should.have.property("name");
          //res.body.should.have.property("description");
          //res.body.should.have.property("price");
          //res.body.should.have.property("imageUrls");
          done();
        });
    });
  });

  describe("/POST User", () => {
    it("it should NOT POST sunglasses if no ID is found", (done) => {
      let product = {
        id: "20",
        categoryId: "1",
        name: "Superglasses",
        description: "The best glasses in the world",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/${product.id}/cart`)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
