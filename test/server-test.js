const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('BRANDS', () => {
  describe('GET /api/brands', () => {
    it('should return an array of all the brands', done => {
      // arrange
      // act
      chai
        .request(server)
        .get('/api/brands')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(5);
          done();
        });
    });
    it('should return the number of brands in the query', done => {
      // arrange: "limit=4"
      // act
      chai
        .request(server)
        .get('/api/brands?limit=4')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(4);
          done();
        });
    });
    it('should return an error if the query is NaN', done => {
      // arrange: "limit=boogers"
      // act
      chai
        .request(server)
        .get('/api/brands?limit=boogers')
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
  });
  describe('GET /api/brands/:brandId/products', () => {
    it('should return an array of products with the given brandId', done => {
      // arrange: "brandId = 1"
      // act
      chai
        .request(server)
        .get('/api/brands/1/products')
        .get((error, response) => {
          // assert
          response.status.should.equal(200);
          done();
        });
    });
  });
});
