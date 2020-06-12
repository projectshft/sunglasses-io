const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET ALL BRANDS
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
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
});

//GET ALL PRODUCTS BY BRAND
describe("/GET products by brand", () => {
  it.only("should GET all products in a brand", done => {
    chai
      .request(server)
      .get("/api/brands/1/products") //testing for brand id 1
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3);
        done();
        });
    });
  it.only("fails as expected with unknown id", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/api/brands/7/products") //7 is an unidentified id
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
        });
    });
});

//GET ALL PRODUCTS BY SEARCH
describe("/GET products", () => {
  it.only("should GET all products", done => {
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
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=sweetest")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only("should return all products if query is missing", done => {
    chai
    .request(server)
    .get("/api/products?query=")//when there is no query provided
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(11);//length of total product list
      done();
      });
  });
  it.only("fails as expected with unrecognized query", done => {
    chai
      .request(server)
      .get("/api/products?query=banana") //should this be here? Right now I have it set up so that if a query doesn't return anything, theres an error. Should empty search results be an error?
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});