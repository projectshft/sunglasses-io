let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let should = chai.should();

chai.use(chaiHttp)

describe('/GET api/brands', () => {
  it('should return array of sunglasses brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
})

describe('/GET /api/brands/:id/products', () => {
  it('should GET a product by the given id', done => {

    let productId = 1

    chai
      .request(server)
      .get(`/api/brands/${productId}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id')
        done();
      })
  })
})

describe('/GET /api/products', () => {
  it('should get all products', done => {
    chai
      .request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done()
    })
  })
})

describe('/POST /api/login', () => {
    it('should log a user in', done => {

      const loginAttempt = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }

      chai
        .request(server)
        .post(`/api/login?${loginAttempt}`)
        .send(loginAttempt)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('login')
          res.body.should.have.deep.nested.property('login.username')
          res.body.should.have.deep.nested.property('login.password')
          done()
        })
    })
})

//incomplete testing
describe('/GET /api/me/cart', () => {
  it('should return the users cart', done => {

    const loginAttempt = {
      username: 'yellowleopard753',
      password: 'jonjon'
    }

    chai
      .request(server)
      // .post(`/api/login?${loginAttempt}`)
      .get('api/me/cart')
      .send(loginAttempt)
      .end((err, res) => {
        res.should.have.status(200)

        done()
      })
  })
})