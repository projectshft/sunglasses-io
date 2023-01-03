var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const products = require('../initial-data/products.json')

should = chai.should();
chai.use(chaiHttp)  

// All Products (passed)
describe('Get products', () => {
  it('Should return all products', done => {
    chai 
      .request(server)
      .get('/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.equal(11);
        res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
        done();
      })
    })
  })


// Return a list of products by a specific brand (with the same categoryId)
describe('Get specific brand products', () => {
  it('Should return a list of products by brand id ', done => {
    chai 
      .request(server)
      // .get('/products/${id}')
      .get('/products/2')
      .end((err, res) => {
        // console.log(res.body)
        res.should.have.status(200);
        res.body.should.be.an("array");
        // res.body.length.should.be.eql(1);
        res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
        done();
      })
    })
  })