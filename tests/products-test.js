let chai = require("chai");
let chaiHttp = require("chai-http");
const chaiThings = require('chai-things');
let server = require("../app/server");

chai.should();
chai.use(chaiHttp);
chai.use(chaiThings);

describe("products", () => {
  describe("/GET product", () => {
    it("it should GET all of the products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.above(0);
          done();
        });
    });
  }); 
  describe('/GET product by brandId', () => {
    it('should GET all products associated with brandId', (done) => {
      const brandId = '2';
  
      chai
        .request(server)
        .get('/api/products/:brandId')
        .send({ brandId })
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.all.satisfy(
            (product) => product.categoryId === brandId
          );
          done();
        });
    });
  }); 
});