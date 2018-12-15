let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  // Brands
  describe('Brands', () => {
    describe('/GET brands', () => {
      it('should GET all brands', done => {
        chai
          .request(server)
          .get('/api/brands')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
          });
      });
    });
  });

  // Products
  describe('', () => {
    
  });

  // Users
  describe('', () => {
    
  });
});
