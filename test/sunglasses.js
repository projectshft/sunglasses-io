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
      chai
        .request(server)
        .get("v1/sunglasses")
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
        .get("/v1/brands")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
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
        .get("/v1/me")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("object");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
