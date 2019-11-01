const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const should = chai.should();

chai.use(chaiHttp);

// BRANDS //
describe('Brands', () => {
  // GET /api/brands
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  // GET /api/brands/:id/products
  // valid brand id
  describe('/GET brands/:id/products with valid id param', () => {
    it('it should GET all the products associated with the given brand id', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('/GET brands/:id/products with invalid id param', () => {
    it('it should return an error', done => {
      chai
        .request(server)
        .get('/api/brands/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

// PRODUCTS //
describe('Products', () => {
  // GET /api/products
  describe('/GET products', () => {
    it('it should GET all the products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

// USER //
describe('User', () => {
  // POST /api/login for valid credentials
  describe('/POST login with valid creds', () => {
    it('it should POST for login and return a session token as a string with 16 chars', done => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'susanna.richards@example.com',
          password: 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('token');
          res.body.token.should.be.a('string');
          res.body.token.length.should.eql(16);
          done();
        });
    });
  });

  // POST /api/login for invalid credentials
  describe('/POST login with invalid password', () => {
    it('it should POST for a login, but return error for invalid creds', done => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'susanna.richards@example.com',
          password: 'blah'
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST login with invalid email', () => {
    it('it should POST for a login, but return error for invalid creds', done => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 's.richards@example.com',
          password: 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  // POST login with missing credential parameters
  describe('/POST login with missing email', () => {
    it('it should POST for a login, but return error for incorrect request', done => {
      chai
        .request(server)
        .post('/api/login')
        .send({

          password: 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/POST login with missing password', () => {
    it('it should POST for a login, but return error for incorrect request', done => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 's.richards@example.com'
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

