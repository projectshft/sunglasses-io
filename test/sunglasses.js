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
    it('it should GET a product by name matching exact query', done => {
      chai.request(server)
        .get('/api/products?query=Peanut%20Butter')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql('Peanut Butter')
          done();
        })
    })
    it('it should GET all products by name that contain the query(case INsensitive)', done => {
      chai.request(server)
        .get('/api/products?query=superglasses')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body[0].name.should.be.eql('Superglasses')
          done();
        })
    })
    it('it should GET all products by name OR description that contain the query', done => {
      chai.request(server)
        .get('/api/products?query=spiciest')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body[0].name.should.be.eql('Habanero')
          done();
        })
    })
    it('it should return 404 error when no products found matching query', done => {
      chai.request(server)
        .get('/api/products?query=spiciest')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body[0].name.should.be.eql('Habanero')
          done();
        })
    })
  })
})