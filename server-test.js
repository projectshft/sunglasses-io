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

  //specific product

  //specific brand
})

