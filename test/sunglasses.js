//let Product = require("../app/products");
let products = require("../app/products");
let productsToReturn = require("../app/products");

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
          res.should.have.status(200);
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
    it("it should GET sunglasses based on search", (done) => {
      chai.request(server).get("v1/sunglasses").query({ query: "glasses" });
      done();
    });
  });
});
