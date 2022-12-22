var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const products = require('../initial-data/products.json')

should = chai.should();
chai.use(chaiHttp)  

// All Products
describe('Products', () => {
  describe('Get products', () => {
    it('Should return all products', done => {
      chai 
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
          done();
        })
      })
    })
  })


// GET products by brand id





  // describe('ProductID', () => {
  //   describe('Get specifc product by ID', () => {
  //     it('Should return a products with a given ID', done => {
  //       chai 
  //         .request(server)
  //         .get('/products/productID')
  //         .end((err, res) => {
  //           res.should.have.status(200);
  //           res.body.should.be.an("object");
  //           res.body.length.should.be.eql(1);
  //           res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
  //           done();
  //         })
  //       })
  //     })
  //   })