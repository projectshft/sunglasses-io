
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

let removeAll = function () {
  products = [];
}

chai.use(chaiHttp);

describe('Products', () => {
  beforeEach(() => {
    removeAll();
  })

  describe('/GET Products', () => {
    it("it should GET all of the products", done => {
      chai
      .request(server)
      .get('/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
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
        res.body.should.be.an('array');
        res.body.length.should.be.eql(0);
        //Enable to test with test dummy data id: 2 in server
        // res.body.length.should.be.eql(10);
        done();
      });
    });
  });
})

