const chai = require('chai');
const chaiHttp = require('chai-http');
let { expect } = require('chai');
let server = require('../app/server');

const brands = require('../initial-data/brands.json')
const products = require('../initial-data/products.json')

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
  })
})

const id = '2';
//test 3 brand id products
describe(`/api/brands/:${id}/products`, () => {
  it(`return an array of products with the category id of ${id}`, (done) => {
    chai
      .request(server)
      .get(`/api/brands/${id}/products`)
      .end((err, res) => {
        res.should.have.status('200');
        res.body.should.be.an('array');
        res.body.forEach((product) => {
          product.should.have.property('categoryId').that.equals(id);
          product.should.have.property('name');
          product.should.have.property('price');
          product.should.have.property('imageUrls');
        });
        done();
        });
    })
  })


//test 4 POST /api/login
  
describe('/api/login', () => {
  describe('POST', () => {
    it('returns an access token if login is valid', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({ username: 'lazywolf342', password: 'tucker' })
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.a('string');
          done();
        });
    });
  })
})


//test 5 
