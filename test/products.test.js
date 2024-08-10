const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app/server'); // Adjust this path as needed
const expect = chai.expect;

chai.use(chaiHttp);

describe('Products API', () => {
  it('should GET all products', (done) => {
    chai.request(app)
      .get('/products')
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});
