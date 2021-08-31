let server = require('../app/server');

let chai = require('chai');
let chaiHttp = require('chai-http');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET products', () => {
    it('it should get all the sunglasses in the store', (done) => {
      chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
        })
    })
  })
})


describe('/GET Brands', () => {
  it('it should get all brands', (done) => {
    chai
      .request(server)
      .get('/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.lenght.should.be.eq(5);
        done();
      })
  })
})


describe('Get sunglasses by brand', () => {
  describe('/GET sunglasses by brand', () => {
    it('it should get all sunglasses of specific brand', (done) => {
      chai
        .request(server)
        .get('/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(3);
          done();
        })
    })
    it('it should return an error if a brand with no sunglasses is entered', (done) => {
      chai
        .request(server)
        .get('/brands/6/products')
        .end((err, res) => {
          err.should.have.status(404);
          done();
        })
    })
  })
})

