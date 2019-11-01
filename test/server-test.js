const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  // GET /api/brands
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
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

  // GET /api/brands/:id/products
  describe('/GET brands/:id/products', () => {
    it('it should GET all the products associated with the given brand id', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });
});

describe('Products', () => {
  // GET /api/products
  describe('/GET products', () => {
    it('it should GET all the products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});