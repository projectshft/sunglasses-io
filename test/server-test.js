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
    it('it should return a session token as a string with 16 chars', done => {
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
    it('it should return error for invalid creds', done => {
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
    it('it should return error for invalid creds', done => {
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

  // POST login with missing email credential parameter
  describe('/POST login with missing email', () => {
    it('it should return error for incorrect request', done => {
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

  // POST login with missing password parameter
  describe('/POST login with missing password', () => {
    it('it should return error for incorrect request', done => {
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

  // GET cart
  // Valid session token
  describe('/GET logged-in user cart', () => {
    it('it should return cart for a valid session token', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .query({
          token: 'random1661modnar'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });

  // Missing session token
  describe('/GET logged-in user cart', () => {
    it('it should respond with error if token not in request', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .query({
          
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // Invalid session token
  describe('/GET logged-in user cart', () => {
    it('it should respond with error if token is invalid', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .query({
          token: 'invalidtoken'
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // POST cart
  // Valid token and product
  describe('/POST item to cart with valid token and product', () => {
    it('it should return cart with item included', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .query({
          token: 'random1661modnar'
        })
        .send({
          "id": "10",
          "categoryId": "5",
          "name": "Peanut Butter",
          "description": "The stickiest glasses in the world",
          "price":103,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });

  // Missing token
  describe('/POST item to cart with missing token', () => {
    it('it should return error', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .query({
          
        })
        .send({
          "id": "10",
          "categoryId": "5",
          "name": "Peanut Butter",
          "description": "The stickiest glasses in the world",
          "price":103,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // Invalid token
  describe('/POST item to cart with invalid token', () => {
    it('it should return error', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .query({
          token: 'invalidtoken'
        })
        .send({
          "id": "10",
          "categoryId": "5",
          "name": "Peanut Butter",
          "description": "The stickiest glasses in the world",
          "price":103,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // Invalid product
  describe('/POST item to cart with invalid product', () => {
    it('it should return error', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .query({
          token: 'invalidtoken'
        })
        .send({
          "id": "10",
          "categoryId": "5",
          "name": "Peanut Butter!!!!!",
          "description": "The stickiest glasses in the world",
          "price":103,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // Invalid product
  describe('/POST item to cart with missing product', () => {
    it('it should return error', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .query({
          token: 'invalidtoken'
        })
        .send()
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

});

