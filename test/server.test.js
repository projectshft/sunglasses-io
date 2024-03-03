let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server"); // Adjust the path as needed
let should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

describe("/GET Brands", () => {
  it("it should Get all the brands", (done) => {
    return chai
      .request(server)
      .get("/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });
});

describe("/GET /brands/brandId/products", () => {
  it("it should Get all the products from a brand", (done) => {
    return chai
      .request(server)
      .get("/brands/2/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.be.eql(2);
        res.body.should.be.an("array");
        done();
      });
  });
  it("It should not Get any products if the brand does not exist", (done) => {
    return chai
      .request(server)
      .get("/brands/a/products")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

// describe("Login", () => {});

// describe("Cart", () => {});
