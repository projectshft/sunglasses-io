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
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
  
              res.body.forEach((cartItem) => {
                cartItem.should.have.property('product');
                cartItem.should.have.property('quantity');
              });
  
              done();
            });
        });
    });
  });
  describe('POST /api/me/cart', () => {
    it('should post the users current cart', (done) => {

      // replace token with console logged token in the terminal, expires every hour
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InllbGxvd2xlb3BhcmQ3NTMiLCJpYXQiOjE3MDg3MDkzOTAsImV4cCI6MTcwODcxMjk5MH0.GLKt_gkAxLCtmzqXS6q6rPFBtxu5ZIH3Uc3kKfQIQfk';
    
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
      // Test product to be added to cart
      const productToAdd = {
        id: '10'
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
        .post(`/api/me/cart/10`) // hardcoded ID as 10 for testing
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
        .post('/api/me/cart/10') // assuming productId is '10'
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


  describe('DELETE /api/me/cart/:productId', () => {
    it('should remove a product from the users cart', (done) => {

      // Product to be removed from cart
      const productIdToRemove = '10';
      
      // Login to get token
      chai.request(server)
        .post('/api/login')
        .set('content-type', 'application/json')
        .send({
          username: 'yellowleopard753',
          password: 'jonjon'
        })
        .end((loginErr, loginRes) => {
          // Check if login was successful
          loginRes.should.have.status(200);
          loginRes.body.should.have.property('token');
      
          const token = loginRes.body.token;
      
          // Perform a DELETE request to /api/me/cart/:productId with the obtained token
          chai.request(server)
            .delete(`/api/me/cart/${productIdToRemove}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
      
              // Check if the product has been removed from the cart
              const removedProduct = res.body.find(item => item.product.id === productIdToRemove);
              expect(removedProduct).to.not.exist;
      
              done();
            });
          });
        });
      
    it('should return 401 for unauthorized access', (done) => {
      chai.request(server)
        .delete('/api/me/cart/10') // assuming productId is '10'
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
      
          // Perform a DELETE request to /api/me/cart/:productId with the obtained token for a non-existing product
          chai.request(server)
            .delete('/api/me/cart/nonExistingProductId')
            .set('Authorization', `Bearer ${token}`)
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
