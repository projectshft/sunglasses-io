let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  // GET brands - test for a successful get request for brands
  describe('/GET brands', () => {
    it('it should get all of the brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    })
  });

  // GET brands - test successfully getting all products for a brand 
  describe('/GET brands', () => {
    it('it should get all of the products for a brand', done => {
      chai
        .request(server)
        .get('/brands/2/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.be.eql(2);
          done();
        });
    })
  });

  // GET brands - test for an invalid product Id for getting a brand
  describe('/GET brands', () => {
    it('it should return an error message with status code 404', done => {
      chai
        .request(server)
        .get('/brands/10/products')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.message.should.be.eql('No products found')
          done();
        })
    })
  });
});

