const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app/server'); // Update path if necessary
const expect = chai.expect;

chai.use(chaiHttp);

describe('Brands API', () => {
  it('should GET all brands', (done) => {
    chai.request(app)
      .get('/brands')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length.above(0);
        done();
      });
  });

  it('should GET products by brand', (done) => {
    chai.request(app)
      .get('oakley/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        
        done();
      });
  });

  it('should return 404 for an unknown brand', (done) => {
    chai.request(app)
      .get('/brands/unknownbrand/products')
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('message', 'Brand not found');
        done();
      });
  });
});
