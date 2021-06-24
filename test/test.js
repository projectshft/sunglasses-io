const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

// tests to get all the brands
describe('/GET all the brands', () => {
  it('it should get all the brands', (done) => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.not.have.status(401);
        res.body.should.be.an('object');
        done();
      });
  });
});

describe('/GET products of brand ID', () => {
  it('It should GET all products for given brand id', (done) => {
    chai
      .request(server)
      .get('/api/brands/1/products')

      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
  });
});

describe('/GET all the products', () => {
  it('It should GET all the products', (done) => {
    chai
      .request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('/POST logging in', () => {
  const inValidLogin = { username: 'wrong-user', password: 'wrong-pass' };
  const validLogin = { username: 'greenlion235', password: 'waters' };

  it('It should return a 401 error if incorrect credentails', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(inValidLogin)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should return a access token if login is a success', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .send(validLogin)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.should.have.lengthOf(16);
        done();
      });
  });
});

describe(' Users cart', () => {
  let validToken;
  before('login', () => {
    const validLogin = { username: 'greenlion235', password: 'waters' };
    chai
      .request(server)
      .post('/api/login')
      .send(validLogin)
      .end((err, res) => {
        validToken = res.body;
      });
  });
  describe('/GET users cart', () => {
    it('it should get the logged in users cart', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .query({ validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
    it('it should return an error if the token is invalid or missing', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe('/Post adds to cart', () => {
    it('it should add an item to users cart', (done) => {
      chai
        .request(server)
        .post('/api/me/cart/1')
        .query({ validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
    it('it should give an error if the user is not logged in', (done) => {
      chai
        .request(server)
        .post('/api/me/cart/1')
        .end((err, res) => {
          res.should.have.status(401);
          res.res.statusMessage.should.be.a('string');
          done();
        });
    });
    it('it should give an error 404 if product is not found', (done) => {
      chai
        .request(server)
        .post('/api/me/cart/')
        .query({ validToken })
        .end((err, res) => {
          res.should.have.status(404);
          res.res.statusMessage.should.be.a('string');
          done();
        });
    });
  });
  describe('/Delete deletes items in cart', () => {
    it('it should delete an item from logged in users cart', (done) => {
      chai
        .request(server)
        .delete('/api/me/cart/1')
        .query({ validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
    it('it should return an error if the token is invalid or missing', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
// GET /api/brands passing

// GET /api/brands/:brandId/products

// GET /api/products

// POST /api/login

// GET /api/me/cart

// POST /api/me/cart/:productId

// DELETE /api/me/cart/:productId
