const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

const expect = chai.expect;
const assert = chai.assert;
// let should = chai.should();

chai.use(chaiHTTP);

// describe... endpoints 

// GET BRANDS
describe("/GET brands", () => {
  it("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
  it.skip("should fail as expected when no brands are found", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

// GET PRODUCTS
describe("/GET products", () => {
  it("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
});