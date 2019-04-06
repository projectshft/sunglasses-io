let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');

let should = chai.should();

chai.use(chaiHttp);

//desribe the products
describe('Products', () => {
  //describe the get call of the products
  describe('GET products', () => {
    //it for what GET products should do
    it('should return all products', done => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return product based on query', done => {
      chai
        .request(server)
        .get('/products?query=Black')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.eql(1); //another way to check length
          done();
        });
    });
    it('should return all products if query param is empty', done => {
      chai
        .request(server)
        .get('/products?query=')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return 404 if no product matches the query', done => {
      chai
        .request(server)
        .get('/products?query=ponies')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});

//describe the brands
describe('Brands', () => {
  //describe the Brands GET
  describe('GET brands', () => {
    //it for what Get brands should do
    it('should return all brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(5);
          done();
        });
    });
    //describe GET products by brand ID
    describe('by brandId/products', () => {
      //it for what the describe should do
      it('should return all products matching brand ID', done => {
        chai
          .request(server)
          .get('/brands/2/products')
          .end((error, response) => {
            response.should.have.status(200);
            response.body.should.be.an('array');
            response.body.should.have.length(2);
            done();
          });
      });
    });
  });
});
