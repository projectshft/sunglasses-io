let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect, assert } = require("chai");
let should = chai.should();
chai.use(chaiHttp);

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
    .request(server)
    .get("/brands")
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      res.should.have.status(200);
      expect("Content-Type", "application/json");
      res.body.should.be.an("array");
      done();
    })
  })
});

describe('/GET brands/:id/products', () => {
  it.only('should GET all products for given brand', done => {
    chai
      .request(server)
      .get('/brands/1/products')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an("array");
        done();
      });
  });
  it.only("should throw an error when given an invalid id", done => {
    chai
      .request(server)
      .get("/brands/55/products")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
    .request(server)
    .get("/products")
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      res.should.have.status(200);
      expect("Content-Type", "application/json");
      res.body.should.be.an("array");
      done();
    })
  })
});