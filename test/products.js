
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const should = chai.should();
chai.use(chaiHttp);

describe('/GET Products', () => {
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

describe('/GET Products/:id', () => {
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


