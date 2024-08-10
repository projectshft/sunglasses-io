const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app/server'); // Adjust this path as needed
const expect = chai.expect;

chai.use(chaiHttp);

describe('Cart API', () => {
  it('should add an item to the cart', (done) => {
    chai.request(app)
      .post('/cart')
      .send({ productId: 1, quantity: 1 }) // Adjust based on your request body
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get cart items', (done) => {
    chai.request(app)
      .get('/cart')
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should remove an item from the cart', (done) => {
    chai.request(app)
      .delete('/cart/1') // Assuming item ID is 1
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        done();
      });
  });
});
