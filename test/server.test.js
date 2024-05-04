const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();
chai.use(chaiHttp);

// Tests for Brands endpoint
describe('Brands', () => {
    it('should retrieve all brands', (done) => {
        chai.request(server)
            .get('/api/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.above(0);
                done();
            });
    });
});

// Tests for Products endpoint
describe('Products', () => {
    it('should retrieve all products', (done) => {
        chai.request(server)
            .get('/api/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.above(0);
                done();
            });
    });
});

// Tests for Login endpoint
describe('Login', () => {
    it('should authenticate user', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpassword' }) // Provide valid credentials
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                done();
            });
    });

    it('should return unauthorized for invalid credentials', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({ username: 'invaliduser', password: 'invalidpassword' }) // Provide invalid credentials
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});

// Testss for Cart endpoint
describe('Cart', () => {
    describe("/GET cart", () => {
        it("should only get cart if logged in", (done) => {
          chai
            .request(server)
            .get("/api/me/cart")
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
      });
      // POST items to the cart
      describe("/POST cart", () => {
        it("should POST product to cart", (done) => {
          const productId = 1;
          const userId = 1;
          chai
            .request(server)
            .post("/api/me/cart")
            .send({ userId: userId, productId: productId })
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("shouldn't POST product if user or product doesn't exist", (done) => {
          const productId = 20;
          const userId = 20;
          chai
            .request(server)
            .post("/api/me/cart")
            .send({ userId: userId, productId: productId })
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
      });
      // DELETE items from the cart
      describe("/DELETE cart", () => {
        it("should DELETE an item from the cart", (done) => {
          const productId = 1;
          chai
            .request(server)
            .delete(`/api/me/cart/${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("should not DELETE an object that doesn't exist in the cart", (done) => {
          const productId = 21;
          chai
            .request(server)
            .delete(`/api/me/cart/${productId}`)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
      });
      describe("/PATCH cart", () => {
        it("should update quantity of an item in the cart", (done) => {
          const productId = 1;
          const quantity = 2;
    
          chai
            .request(server)
            .patch(`/api/me/cart/${productId}`)
            .send({ quantity: quantity })
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        it("should return 404 if no item is found in cart", (done) => {
          const productId = 20;
          const quantity = 2;
          chai
            .request(server)
            .patch(`/api/me/cart/${productId}`)
            .send({ quantity: quantity })
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
      });
    });