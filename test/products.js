
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let should = chai.should();
chai.use(chaiHttp);

describe('/GET Produces', () => {
 it("should get all products", done => {
  chai
    .request(server)
    .get('/products')
    .end((err, res) => {
      res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
    });
  });
});

describe('/GEt Products/:id', () => {
  it("should get all products in a brand", (done) => {
    chai
    .request(server)
    .get('/brands/:brandId/products')
    .end((err, res) => {
      res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
    });
  });
});
describe('/GET Products/:id', () => {
  it("it should GET all of the products that match brandId", done => {
    chai
    .request(server)
    .get('/brands/:brandId/products')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.an("array");
      res.body.length.should.be.eql(0);
      done();
    });
  });
});

