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

describe('Login', () => {
  describe('/POST login', () => {
    it('it should return an error if the user submits no username or password', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: '', password: '' })
        .end((error, response) => {
          response.should.have.status(405)
          response.should.not.have.property('password')
          response.should.not.have.property('username')
          done()
        })
    })
    it('it should return an error if the user submits an incorrect password or username', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'madeline', password: '342623q' })
        .end((error, response) => {
          response.should.have.status(406)
          response.should.not.have.property('password')
          response.should.not.have.property('username')
          done()
        })
    })
    it('it should return an access token if the user submits a valid username and password', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200)
          response.type.should.equal('application/json')
          accessToken = response.header.newAccessToken
          should.not.exist(error)
          done()
        })
    })
  })
})

describe('Cart', () => {
  describe('/GET cart', () => {
    it('it should allow a user to access their cart if they are logged in', done => {
      console.log(accessToken)
      chai
        .request(server)
        .get('/me/cart')
        .set('xauth', 'accessToken')
        .end((error, response) => {
          response.should.have.status(200)
          done()
        })
    })
  })
})
