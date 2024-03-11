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

    let productId = 4

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

      chai
        .request(server)
        .post('/api/login')
        .send({
          username: 'yellowleopard753',
          password: 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(200);
          done()
        })
    })

    it('should return 401 message if username or password is incorrect', done => {
      chai
      .request(server)
      .post('/api/login')
      .send({
        username: 'yellowleopard753',
        password: 'jimjim'
      })
      .end((err, res) => {
        res.should.have.status(401)
        done()
      })
    })

    it('should return 400 error if either field is empty', done => {
      chai
      .request(server)
      .post('/api/login')
      .send({
        username: 'yellowleopard753',
        password: ''
      })
      .end((err, res) => {
        res.should.have.status(400)
      })
      done()
    })
})

describe('/GET /api/me/cart', () => {
  it('should return the users cart', done => {

    chai
      .request(server)
      .get('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array');
        done()
      })
  })
})

describe('/POST /api/me/cart', () => {
  it('should post a new item into the users cart', done => {
    chai
    .request(server)
    .post('/api/me/cart')
    .send({productId:9})
    .end((err,res) => {
      res.should.have.status(200)
      res.body.should.be.an('array')
      res.body.should.have.length(1)
    })
    done()
  }) 
})

describe('/DELETE /api/me/cart/:productId', () => {
  it('should remove the selected item from the cart', done => {
    let productId = 2

    chai
    .request(server)
    .delete(`/api/me/cart/${productId}`)
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.be.an('array')
      res.body.should.have.lengthOf(3)
    })
    done()
  })
})

describe('/PUT /api/me/cart/:productId', () => {
  it('', done => {
    let qty = 2;
    let productId = 5;

    chai
    .request(server)
    .put(`/api/me/cart/${productId}`)
    .send({qty: qty})
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.be.an('array')
      res.body.should.have.length(6)
    })
    done()
  })
})