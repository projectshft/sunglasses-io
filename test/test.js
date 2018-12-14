const chai = require('chai')
const chaiHTTP = require('chai-http')
let server = require('../app/server')
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
chai.use(chaiHTTP);

//TDD!

describe('sunglasses', () => {
  describe('/get sunglasses' , () => {
    it('should retrieve the list of sunglasses from the store', (done) => {
      chai.request(server)
      .get('/v1/sunglasses')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
        done()
      })
    })
  })
  describe('get sunglasses by ID', () => {
    it('should retrieve one sunglasses object' , done => {
      chai.request(server)
      .get('/v1/sunglasses/10')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('id');
        res.body.should.have.property('categoryId');
        res.body.should.have.property('price');
        res.body.should.have.property('description');
        res.body.should.have.property('imageUrls')

        done()
      })
    })
  })
})
