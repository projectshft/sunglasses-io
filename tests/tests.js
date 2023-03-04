const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const should = chai.should();
const { expect } = require('chai');

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET Brands", () => {
    it('should return all the brands', (done) => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  });

  describe("/GET Products by brand", () => {
    it('should return products by brand id', (done) => {
      const brandId = "2"
      chai.request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('categoryId');
          res.body[0]['categoryId'].should.be.eql('2');
          done();
        })
    })
  });
});


// GET Products
// POST Login
// GET User Cart
// POST Add to Cart
// POST Update Cart Quantity
// DELETE Remove from Cart