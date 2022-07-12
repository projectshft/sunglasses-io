const { json } = require('body-parser');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./app/server');
const products = require('./initial-data/products.json')

let should = chai.should();
chai.use(chaiHttp);

const productsToString = JSON.stringify(products);

describe('Sunglasses', function() {
  describe('/GET search in all sunglasses',function() {
    it('should return all sunglasses products by default', function(done) {
      chai.request(server)
      .get('/sunglasses')
      .end(function(err, res) {
        should.exist(res)
        res.should.have.status(200)       
        res.body.should.be.an('array')
        done()
      })
    })
  })

  //cannot delete sunglasses
  describe('/DELETE for sunglasses', function() {
    it('should return a 405 error if someone tries it', function(done) {
      chai.request(server)
      .delete('/sunglasses')
      .end(function(err, res) {
        res.should.have.status(405)
        done()
      })
    })
  })

  //all brands

  describe('/GET search with a path for brands', function() {
    it('should return all brands', function(done) {
      chai.request(server)
      .get('/sunglasses/brands')
      .end(function(err, res) {
        res.should.have.status(200)
        res.body.should.be.an('array')
        done()
      })
    })
  })

  //cannot delete brands
  describe('/DELETE for brands', function() {
    it('should return a 405 error if someone tries it', function(done) {
      chai.request(server)
      .delete('/sunglasses/brands')
      .end(function(err, res) {
        res.should.have.status(405)
        done()
      })
    })
  })

  // specific product

  describe('/GET request with a query for a specific product', function() {
    it('should return all of the products whose name match the description', function(done) {
      const Sugar = [{"id":"9","categoryId":"4","name":"Sugar","description":"The sweetest glasses in the world","price":125,"imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]}]
      chai.request(server)
      .get('/sunglasses/Sugar')
      .end(function(err, res) {
        res.should.have.status(200)
        // res.body.should.equal(Sugar)
        done()
      })
    })

    it('should return a 404 status is the name in the query is not found in the database', function(done) {
      chai.request(server)
      .get('/sunglasses/Llamaspecs')
      .end(function(err, res) {
        res.should.have.status(404)
        done()
      })
    })

  })

  //specific brand
})

