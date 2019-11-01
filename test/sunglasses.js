let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);

// Aranging
describe('Brands', () => {
  describe('/GET api/brands', () => {
    // Acting
    it('it should GET all the brands in initial-data', done => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  })
})

describe('Products', () => {
  describe('/GET api/products', () => {
    // Acting
    it('it should GET all the products in initial-data', done => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
})