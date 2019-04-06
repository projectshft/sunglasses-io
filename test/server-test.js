const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

// Tests for /api/brands endpoint

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        //chai.expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});

// Tests for /api/products endpoint

describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(11);
        done();
      });
  });
});

// Tests for /api/brands/:id/products endpoint

describe("/GET products by brand ID", () => {
  it.only("should GET all products for a brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(3);
        done();
      });
  });
  it.only("should GET 404 error for no matches to brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/6/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(404);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("object");
        done();
      });
  });
});