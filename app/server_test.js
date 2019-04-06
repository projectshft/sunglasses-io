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
          response.body.length.should.be.eql(1);
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
