let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server').server;
let currentUser = require('../app/server').currentUser;

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

  describe('/POST cart', () => {
    it("should POST to a user's cart", done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          id: 1,
          brandId: 1,
          name: 'Superglasses',
          description: 'The best glasses in the world',
          price: 150,
          imageUrls: [
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
          ]
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });

    it('should NOT POST an empty product', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST cart/:productId', () => {
    before(done => {
      currentUser.cart = [
        {
          id: '1',
          brandId: '1',
          name: 'Superglasses',
          description: 'The best glasses in the world',
          price: 150,
          imageUrls: [
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
            'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
          ],
          quantity: 2
        }
      ];
      done();
    });

    // Update product quantity
    it("should POST update to product in user's cart", done => {
      chai
        .request(server)
        .post('/api/me/cart/1')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ quantity: 25 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });

    it("should DELETE product in user's cart", done => {
      chai
        .request(server)
        .del('/api/me/cart/1')
        .end((err, res) => {
          res.should.have.status(200);
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
