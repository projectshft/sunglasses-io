const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const server = require('../app/server');

chai.should();
chai.use(chaiHttp);
chai.use(chaiThings);

describe('Cart', () => {
  describe('/GET cart', () => {
    it('should get an array of all the products in the user cart', (done) => {
      chai
        .request(server)
        .get('/me/cart')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          done();
        });
    });
  });

  describe('/POST cart', () => {
    it('should send an id of a product and add it to the shopping cart', (done) => {
      const productId = '3';

      chai
        .request(server)
        .post('/me/cart')
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
});
