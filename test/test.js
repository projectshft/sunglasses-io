let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET brands', () => {
    it('It should GET all the brands in the store', (done) => {
      chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
        });
    })
  })
  describe('/GET products', () => {
    it('It should GET all the products in the store', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    })
  })
  describe('/GET api/brands/:id/products', () => {
    it('It should GET all products for given brand id', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    })
    it('It should return an error with an invalid brand id', done => {
      chai
        .request(server)
        .get('/api/brands/x/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  })
})

