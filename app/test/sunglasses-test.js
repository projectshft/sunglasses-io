let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET brands', () =>{
    it('it should GET all the brands', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    });
  });

  describe('/GET brands/{id}/products', () => {
    it('it should GET all the products for brand Id given', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        })
    });
  });

});

describe('Products', () => {
  describe('/GET products', () => {
    it('it should GET all the products', done => {
      //arrange
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    });
  });
});