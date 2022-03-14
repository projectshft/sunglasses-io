const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

chai.should();
chai.use(chaiHttp);

describe('Products', () => {
  describe('/GET products', () => {
    it('should get an array of all the products', (done) => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.above(0);
          done();
        });
    });
  });
});
