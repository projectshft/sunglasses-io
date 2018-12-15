let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  // Brands
  describe('Brands', () => {
    describe('/GET brands', () => {
      it('should GET all brands', done => {
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

    describe('/GET brands/:id/products', () => {
      it('should GET all products by brand', done => {
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

      it('should NOT return any products for a brand that does not exist', done => {
        chai
          .request(server)
          .get('/api/brands/123/products')
          .end((err, res) => {
            res.body.should.be.empty;
            res.should.have.status(401);
            done();
          });
      });
    });
  });

  // Products
  describe('/GET products', () => {
    it('should GET all products', done => {
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

  // Cart
  describe('/GET cart', () => {
    it("should GET a user's cart", done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });

  // Login
  describe('/POST login', () => {
    it('should login an existing user', done => {
      chai
        .request(server)
        .post('/api/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string'); // access token
          done();
        });
    });

    it('should NOT login a user with incorrect credentials', done => {
      chai
        .request(server)
        .post('/api/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username: 'yellowleopard753', password: 'wrongpassword' })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
