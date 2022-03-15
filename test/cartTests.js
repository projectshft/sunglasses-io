const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const server = require('../app/server');

const { getTokenFromUsername } = require('../app/loginHelper');
const Cart = require('../app/models/cartModel');

chai.should();
chai.use(chaiHttp);
chai.use(chaiThings);

beforeEach(() => {
  Cart.clearCart();
});

const testUserNames = {
  validUserName: 'greenlion235',
  invalidUserName: 'yellowleopard753',
};

describe('Cart', () => {
  describe('/GET cart', () => {
    it('should get an array of all the products in the user cart', (done) => {
      // getTokenFromUsername(testUserNames.validUserName);

      chai
        .request(server)
        .get('/me/cart')
        .send(testUserNames.validUserName)
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

    it('should return a 400 if no productId', (done) => {
      chai
        .request(server)
        .post('/me/cart')
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('should return a 404 if id invalid', (done) => {
      const productId = '337';

      chai
        .request(server)
        .post('/me/cart')
        .send({ productId })
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe('/DELETE cart', () => {
    it('should send an id of a product and delete only that product from the cart', (done) => {
      // product to delete
      const productId = '3';
      const productIdToKeep = '7';

      Cart.addToCart(productId);
      Cart.addToCart(productIdToKeep);

      chai
        .request(server)
        .delete('/me/cart')
        .send({ productId })
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          // response should not include the deleted id
          response.body.should.not.include.one.satisfy(
            (product) => product.id === productId
          );
          // response should include the 2nd id
          response.body.should.include.one.satisfy(
            (product) => product.id === productIdToKeep
          );
          done();
        });
    });

    it('should return a 400 if no productId', (done) => {
      chai
        .request(server)
        .delete('/me/cart')
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });

    it('should return a 404 if id invalid', (done) => {
      const productId = '337';

      chai
        .request(server)
        .delete('/me/cart')
        .send({ productId })
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});
