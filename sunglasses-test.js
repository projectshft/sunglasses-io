let Brands = require('./initial-data/brands.json')

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server.js');

let should = chai.should();

chai.use(chaiHttp);


describe('/GET brands', () => {
    it('should GET a list of all brands', done => {
      // act
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          // assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5)
          done();
        });
    });
});

describe('/GET brand products', () => {
  it('should GET all products of a given brand', done => {
    // act
    chai
      .request(server)
      .get(`/api/brands/2/products`)
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(2)
        done();
      });
  });
  it ('should error if invalid brand id is passed', done => {
    chai
        .request(server)
        .get(`/api/brands/6/products`)
        .end((err, res) => {
          // assert
          res.should.have.status(404);
          done();
        });
      });
  it ('should error if no brand id is passed', done => {
    chai
        .request(server)
        .get(`/api/brands//products`)
        .end((err, res) => {
          // assert
          res.should.have.status(404);
          done();
        });
      });  
});

describe('/GET products', () => {
  it('should GET a list of all products', done => {
    // act
    chai
      .request(server)
      .get('/api/products')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11)
        done();
      });
  });
});




