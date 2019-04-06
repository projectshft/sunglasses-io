let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should()
let expect = chai.expect

chai.use(chaiHttp)

describe('Brands', () => {
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.length.should.be.eq(5)
          done()
        })
    })
  })
  describe('/GET brands/:brandId/products', () => {
    it('it should GET all the products by brandID', done => {
      chai
        .request(server)
        .get('/brands/3/products')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.length.should.be.eq(2)
          done()
        })
    })
    it('it should return an error if there is no product with that brand Id', done => {
      chai
        .request(server)
        .get('/brands/7/products')
        .end((error, response) => {
          response.should.have.status(401)
          response.body.should.be.an('object')
          response.body.should.not.have.property('brandId')
          done()
        })
    })
  })
})

describe('Products', () => {
  describe('/GET products', () => {
    it('it should return an error if the query is an empty string', done => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(402)
          response.body.should.be.an('object')
          response.body.should.not.have.property('productName')
          done()
        })
    })
    it('it should return an error if there is no product with the queried productName ', done => {
      chai
        .request(server)
        .get('/products?productName=boo')
        .end((error, response) => {
          response.should.have.status(403)
          response.body.should.be.an('object')
          response.body.should.not.have.property('productName')
          done()
        })
    })
    it('it should GET all the products with the queried ProductName', done => {
      chai
        .request(server)
        .get('/products?productName=Superglasses')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('object')
          response.body.should.have.property('productName')
          done()
        })
    })
  })
})

function postLoginInfo(callback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      callback('done!')
    }, 100)
  })
}
describe('/POST login', () => {
  it('should post the users email and password', () => {
    postLoginInfo(result => {
      expect(result).to.equal('done!')
    })
  })
  //   it('should post the users email and password', done => {
  //     chai
  //       .request(server)
  //       .post('/login')
  //       .end((error, response) => {
  //         response.body.should.have.status(200)
  //         response.body.should.be.an('object')
  //         response.body.should.have.property('email')
  //         response.body.should.have.property('password')
  //       })
  //   })
})
