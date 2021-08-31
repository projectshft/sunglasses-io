let server = require('../app/server');

let chai = require('chai');
let chaiHttp = require('chai-http');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET products', () => {
    it('it should get all the sunglasses in the store', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
})


describe('/GET Brands', () => {
  it('it should get all brands', (done) => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eq(5);
        done();
      })
  })
})


describe('Get sunglasses by brand', () => {
  describe('/GET sunglasses by brand', () => {
    it('it should get all sunglasses of specific brand', (done) => {
      let brand =  {
        "id": "1",
        "name" : "Oakley"
    }
      chai
        .request(server)
        .get('/api/brands/' + brand.id + '/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(3);
          done();
        })
    })
    it('it should return an error if a brand with no sunglasses is entered', (done) => {
      chai
        .request(server)
        .get('/api/brands/6/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  })
})

describe('Login request', () => {
  describe('/POST username and password to recieve an access token', () => {
    it('it should provide an access token for a correct login', (done) => {
      let user = {
        "username": "yellowleopard753",
        "password": "jonjon"
      }
      chai
        .request(server)
        .post('/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('username');
          res.body.should.have.property('access_token');
          res.body.should.have.property('last_updated');
          done();
        })
    })
    it('it should throw an error if the username is incorrect', (done) => {
      let user = {
        "username": "greenleopard752",
        "password": "jonjon"
      }
      chai
        .request(server)
        .post('/login')
        .send(user)
        .end((err, res) => {
          err.should.have.status(401);
          done();
        })
    })
    it('it should throw an error if the password is incorrect', (done) => {
      let user = {
        "username": "yellowleopard753",
        "password": "jon"
      }
      chai
        .request(server)
        .post('/login')
        .send(user)
        .end((err, res) => {
          err.should.have.status(401);
          done();
        })
    })
    it('it should throw an error if the password is missing', (done) => {
      let user = {
        "username": "yellowleopard753",
      }
      chai
        .request(server)
        .post('/login')
        .send(user)
        .end((err, res) => {
          err.should.have.status(400);
          done();
        })
    })
  })
});

describe('Cart', () => {
  describe('/GET cart', () => {
    it('should return a cart full of two products', (done) => {
      //fill cart with 2 products
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(2);
          done();
        })
    })
  })
  describe('/POST to add to cart', () => {
    it('should return a cart with three products including the one just added', (done) => {
      //fill cart with 2 products
      //product to send
      chai
        .request(server)
        .post('/me/cart')
        .send(newSunglasses)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(3);
          done();
        })
    })
    it('should not return a cart if the user does not have an access token', (done) => {
      chai
        .request(server)
        .post('/me/cart')
        .send(newSunglasses)
        .end((err, res) => {
          err.should.have.status(401);
          done();
        })
    })
  })
  describe('/DELETE item from cart', () => {
    it('should return a cart with one product without the one deleted', (done) => {
      //fill cart with 2 products
      chai
        .request(server)
        .delete('/me/cart')
        .send(oldSunglasses)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(1);
          done();
        })
    })
  })
  describe('/PUT to change quantity of item in cart', () => {
    it('should return a cart with three products two of which are the same product', (done) => {
      //fill cart with 2 products
      chai
        .request(server)
        .delete('/me/cart')
        .send(newQuant)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(3);
          done();
        })
    })
  })
})