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
    it('should replace the current cart with the new cart', (done) => {
      const testCart = [1, 2, 3];

      chai
        .request(server)
        .post('/me/cart')
        .send(testCart)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.be.eql(testCart);
          done();
        });
    });
  });

  // describe('/POST cart/{productId}', () => {
  //   it('should get an item by id and add it to the shopping cart', (done) => {
  //     const productIdToCheck = '3';

  //     chai
  //       .request(server)
  //       .post(`me/cart/${productIdToCheck}`)
  //       .send()
  //       .end((error, response) => {
  //         response.should.have.status(200);
  //         response.body.should.be.an('array');
  //         response.body.should.include.one.satisfy(
  //           (product) => product.id === productIdToCheck
  //         );
  //         done();
  //       });
  //   });
  // });
});
