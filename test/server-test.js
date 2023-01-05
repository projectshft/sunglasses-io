const chai = require('chai');
const chaiHttp = require('chai-http');
let { expect } = require('chai');
let server = require('../app/server');
// const products = require('../initial-data/products.json');

const should = chai.should();
chai.use(chaiHttp);


//test 1 return all brands
describe('api/brands', () => {
  describe('GET', () => {
    it('it should return an array of brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(5);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');
          
          done();
        });
    });
  })
})

//handling async

//test 2 return all products
describe('api/products', () => {
  describe('GET', () => {
    it('it should return all products', done => {

      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(11);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('price');
          res.body[0].should.have.property('categoryId');

        
          done();
        });
    });
    it('return an err')
  })
})


//test 3 brand id /brands{id}/products
describe('api/brands{id}/products')