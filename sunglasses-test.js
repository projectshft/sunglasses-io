let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

chai.use(chaiHttp);
let should = chai.should();

describe('Products', () => {
  describe('/GET products', () => {
    it('should GET all the products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
})

describe('Brands', () => {
  describe('/GET brands', () => {
    it('should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  })
})