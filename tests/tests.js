// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server.js');

const should = chai.should();
const { expect } = chai;

chai.use(chaiHttp);
// Our parent block
describe('Server Test', () => {
  beforeEach((done) => {
    // Before each test we empty the database
    done();
  });
  /*
   * Test the /GET route
   */

  // test that it gets all the brands
  describe('/GET All Brands', () => {
    it('it should GET all the Brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  // tests that it get all the products
  describe('/GET Products', () => {
    it('it should GET all the Products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });

  // tests that it gets the cart
  describe('/GET Cart', () => {
    it('it should GET all the Cart', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
  });

  // tests that it gets the products with the related id
  describe('/GET Products', () => {
    it('it should GET all the Products related to brand id', (done) => {
      chai
        .request(server)
        .get('/api/brands/:brandId/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
});

// tests that it can add to cart
describe('/POST Product', () => {
  it('should be added to cart', (done) => {
    chai
      .request(server)
      .post('/api/me/cart/:productId')
      .end((err, res) => {
        res.should.have.status(200);

        done();
      });
  });
});

// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId
