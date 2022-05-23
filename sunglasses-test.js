const { expect } = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

chai.use(chaiHttp);
let should = chai.should();

describe('Products', () => {
  describe('/GET products', () => {
    it('should GET all the products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          done();
        })
    })
  })
})

describe('Brands', () => {
  describe('/GET brands', () => {
    it('should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          done();
        })
    });
    it('should GET all the products of a brand', (done) => {
      let id = '1';
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          expect(res.body[0].categoryId).to.equal(id);
          done();
        })
    })
  })
});

describe('Login', () => {
  describe('/POST login', () => {
    it('should login user successfully', (done) => {
      chai
        .request(server)
        .post(`/api/login?username=yellowleopard753&password=jonjon`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.text).to.equal('successfully logged in yellowleopard753');
          done();
        })
    })
  })
})