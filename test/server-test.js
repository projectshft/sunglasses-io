const chai = require('chai');
const chaiHttp = require('chai-http')
const server = require('../app/server');

// const should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
  it('it should GET all the brands', (done) => {
    chai
      .request(server)
      .get('/v1/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
})  

describe('/GET brands/:brandId/product', () => {
  it('it should GET al products in brand by brandId', (done) => {
    chai
      .request(server)
      .get('/v1/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
})  

describe('/GET products', () => {
  it('it should GET all products', (done) => {
    chai
      .request(server)
      .get('/v1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
})  

describe('/POST login', () => {
  it('it should POST the user to login', (done) => {
    let user = {
      username: "yellowleopard753",
      password: "jonjon"
    }
    JSON.stringify(user)
    chai
      .request(server)
      .post('/v1/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string')
        done();
      })
  })
}) 

describe('/GET cart', () => {
  it('it should all products in cart', (done) => {
    chai
      .request(server)
      .get('/v1/cart')
      .query({accessToken: '4Yz8kIppR1rw7z29'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
})

describe('/POST cart/:productId', () => {
  it('it should POST a product to the cart by productId', (done) => {
    chai
      .request(server)
      .post('/v1/cart/1')
      .query({accessToken: '4Yz8kIppR1rw7z29'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      })
  })
})  


describe('/DELETE cart/:productId', () => {
  it('should DELETE a product from the cart given and id', (done) => {
    chai
      .request(server)
      .del('/v1/cart/1')
      .query({accessToken: '4Yz8kIppR1rw7z29'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array')
        done();
      })
  })
})