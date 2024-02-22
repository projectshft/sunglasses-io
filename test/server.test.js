const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed

const should = chai.should();
const { expect } = require('chai');
chai.use(chaiHttp);

// Tests for brands
describe('Brands', () => {
  describe('GET /api/brands', () => {
    it('should get all brands in the store', (done) => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe('GET /api/brands/{brandId}/products', () => {
    it('should get all products specific to brand ID', (done) => {
  
      const brandId = "3";

      chai.request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");

        // Check if all returned products have the correct brandId
        res.body.forEach(product => {
          product.should.have.property('brandId').equal(brandId);
        });
        
        done();
        });
    });
  });

// Tests for products
describe('Products', () => {
  describe('GET /api/products', () => {
    it('should get all products in the store', (done) => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

// Tests for user
describe('User', () => {
  describe('POST /api/login', () => {
    it('should log the user into the system with valid credentials', (done) => {
      const userLoginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon',
      };

      chai.request(server)
        .post('/api/login')
        .send(userLoginInfo)
        .end((err, res) => {
          // successful login
          res.should.have.status(200);
          res.body.should.have.property('token');

          done();
        });
    });

    it('should return 401 with invalid credentials', (done) => {
      const invalidUserLoginInfo = {
        username: 'invalidUsername',
        password: 'invalidPassword',
      };

      chai.request(server)
        .post('/api/login')
        .send(invalidUserLoginInfo)
        .end((err, res) => {
          // unsuccessful login
          res.should.have.status(401);

          done();
        });
    });
  });
  describe('GET /api/me/cart', () => {
    it('should get the contents of the users cart', (done) => {
    // Test user
      const user = {
        login: {
          username: 'yellowleopard753',
          password: 'jonjon',
        },
        cart: [
          {
            product: {
              id: '1',
              name: 'Superglasses',
              price: 150
            },
            quantity: 2,
          },
        ],
      };
      // Perform a login to get a valid token
      chai.request(server)
        .post('/api/login')
        .set('content-type', 'application/json')
        .send({
          username: 'yellowleopard753',
          password: 'jonjon',
        })
        .end((loginErr, loginRes) => {
          // Check if login was successful
          loginRes.should.have.status(200);
          loginRes.body.should.have.property('token');
  
          const token = loginRes.body.token;
  
          // Perform a GET request to /api/me/cart with the obtained token
          chai.request(server)
            .get('/api/me/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ username: user.login.username })
            .end((err, res) => {
              if (res.status === 401) {
                console.log(res.body);
              }
  
              res.should.have.status(200);
              res.body.should.have.property('login');
              res.body.login.should.have.property('username').equal('yellowleopard753');
              res.body.should.have.property('cart');
  
              done();
          });
        });
      });
    });
  describe('POST /api/me/cart', () => {
    it('should post the users current cart', (done) => {
      const testUser = {
        login: { username: 'testuser' },
        cart: []
      };
    
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InllbGxvd2xlb3BhcmQ3NTMiLCJpYXQiOjE3MDg2MzQzNTUsImV4cCI6MTcwODYzNzk1NX0.8QFVD3EFQSgaxjRcn-0NfyMa7fGQYoDgeGyecZL9j54';
    
      chai.request(server)
        .post('/api/me/cart')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
    
          done();
        });
    });
    
    it('should return 401 for unauthorized access', (done) => {
      chai.request(server)
        .post('/api/me/cart')
        .end((err, res) => {
          expect(res).to.have.status(401);
    
          done();
        });
    });
  });

  describe('POST /api/me/cart/:productId', () => {
    it('should add a product to the users cart', (done) => {
      // Test user
      const user = {
        login: {
          username: 'yellowleopard753',
          password: 'jonjon'
        },
        cart: []
      };

      // Product to be added to cart
      const productToAdd = {
        id: '1',
        name: 'Superglasses',
        price: 150
      };

      // Login to get token
      chai.request(server)
        .post('/api/login')
        .set('content-type', 'application/json')
        .send({
          username: 'yellowleopard753',
          password: 'jonjon'
        })
        .end((loginErr, loginRes) => {
          // check if login was successful
          loginRes.should.have.status(200);
          loginRes.body.should.have.property('token');

          const token = loginRes.body.token;

      // Perform a POST request to /api/me/cart/:productId with the obtained token
      chai.request(server)
        .post(`/api/me/cart/1`) // hardcoded ID as 1 for testing
        .set('Authorization', `Bearer ${token}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
    
          // Check if the product has been added to the cart
          const addedProduct = res.body.find(item => item.product.id === productToAdd.id);
          expect(addedProduct).to.exist;
          expect(addedProduct.quantity).to.equal(1);
    
          done();
        });
    });
  });

    it('should return 401 for unauthorized access', (done) => {
      chai.request(server)
        .post('/api/me/cart/1') // assuming productId is '1'
        .end((err, res) => {
          expect(res).to.have.status(401);

          done();
        });
    });

    it('should return 404 for non-existing product', (done) => {
      // Perform a login to get a valid token
      chai.request(server)
        .post('/api/login')
        .set('content-type', 'application/json')
        .send({
          username: 'yellowleopard753',
          password: 'jonjon',
        })
        .end((loginErr, loginRes) => {
          // Check if login was successful
          loginRes.should.have.status(200);
          loginRes.body.should.have.property('token');

          const token = loginRes.body.token;

          // Perform a POST request to /api/me/cart/:productId with the obtained token for a non-existing product
          chai.request(server)
            .post('/api/me/cart/nonExistingProductId')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .end((err, res) => {
              expect(res).to.have.status(404);

              done();
            });
          });
});
});
});
});
});
