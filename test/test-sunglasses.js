const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

// Import data
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

// Brands
describe('Brands', () => {
  // GET /api/brands
  describe('GET /api/brands', () => {
    it('it should get all the brands', (done) => {
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

  // GET /api/brands/{brandId}/products
  describe('GET /api/brands/{brandId}/products', () => {
    it('it should get all the products of a given brand', (done) => {
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

    it('it should return a 400 error if the brand ID is not a positive integer', (done) => {
      chai
        .request(server)
        .get('/api/brands/a/products')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('it should return a 404 error if a given brand does not exist', (done) => {
      chai
        .request(server)
        .get('/api/brands/6/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

// Products
describe('Products', () => {
  // GET /api/products
  describe('GET /api/products', () => {
    it('it should get all the products if no search term is provided', (done) => {
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

    it('it should get only products matching the search term if one is provided', (done) => {
      const searchTerm = 'Habanero';

      chai
        .request(server)
        .get(`/api/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });
});

// Login
describe('Login', () => {
  // POST /api/login
  describe('POST /api/login', () => {
    it('should successfully log in a user if correct username and password are provided', (done) => {
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return a 401 error if invalid username and/or password are provided', (done) => {
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'waters'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return a 400 error if username and/or password are missing', (done) => {
      const loginInfo = {
        username: 'yellowleopard753',
        password: ''
      };

      chai
        .request(server)
        .post('/api/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

// Cart
describe('Cart', () => {
  // GET /api/me/cart
  describe('GET /api/me/cart', () => {
    beforeEach(() => {});

    it('should return an empty array before any items are added', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const currentUser = users[0];
      currentUser.cart = [];

      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('should return an array with the added items after any are added', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const currentUser = users[0];
      const productToAdd = products[0];
      currentUser.cart.push(productToAdd);

      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          res.body.should.deep.eql([productToAdd]);
          done();
        });
    });

    it('should return a 401 error if user is not logged in', (done) => {
      const accessToken = null;

      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  // POST /api/me/cart
  describe('POST /api/me/cart', () => {
    it("should add an item to a user's cart given a product ID", (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = { id: '1' };

      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(productId)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = { id: 'a' };

      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(productId)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 401 error if user is not logged in', (done) => {
      const accessToken = null;
      const productId = { id: '1' };

      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(productId)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return a 404 error if a given product does not exist', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = { id: '20' };

      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(productId)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  // DELETE /api/me/cart/{productId}
  describe('DELETE /api/me/cart/{productId}', () => {
    it("should delete an item from a user's cart given a product ID", (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = '1';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = 'a';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 401 error if user is not logged in', (done) => {
      const accessToken = null;
      const productId = '1';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return a 404 error if a given product does not exist', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = '20';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  // PUT /api/me/cart/{productId}
  describe('PUT /api/me/cart/{productId}', () => {
    it("should update an item from a user's cart given a product ID", (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = '1';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = 'a';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 401 error if user is not logged in', (done) => {
      const accessToken = null;
      const productId = '1';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return a 404 error if a given product does not exist', (done) => {
      const accessToken = 'oo5DD2jLOTLR9s5t';
      const productId = '12';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId
