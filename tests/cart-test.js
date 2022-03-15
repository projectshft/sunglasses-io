let chai = require("chai");
let chaiHttp = require("chai-http");
const chaiThings = require('chai-things');
let server = require("../app/server");

chai.should();
chai.use(chaiHttp);
chai.use(chaiThings);


describe("cart", () => {
  describe("/GET cart", () => {
    it("it should GET all of the products in the cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});

describe('/POST cart', () => {
  it('should add a product to the cart by id', (done) => {
    const productId = '3';

    chai
      .request(server)
      .post('/api/me/cart')
      .send({ productId })
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.should.include.one.satisfy(
          (product) => product.id === productId
        );
        done();
      });
  });
});

describe('/POST cart', () => {
  it('should add a product to the cart by id', (done) => {
    const productId = '5';

    chai
      .request(server)
      .delete('/api/me/cart')
      .send({ productId })
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.an('array');
        response.body.should.include.one.satisfy(
          (product) => product.id === productId
        );
        done();
      });
  });
});


