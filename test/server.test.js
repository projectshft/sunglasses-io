const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

chai.use(chaiHttp);
chai.should();

/**Testing API calls related to brand*/
describe('Brands', () => {
  describe('/GET brands', () => {
    /**Successful get brands*/
    it('should return all available brands of sunglasses', done => {
      chai.request(server)
        .get('/v1/brands')
        .end((err, res) => {
          res.should.have.status(200)
          done();
        });
    });
  });
  describe('/GET specific brand', () => {
    /**Test successfully getting a specific brandId*/
    it('should successfully return sunglasses of a matching brand', done => {
      const brandId = 1;
      chai.request(server)
        .get(`/v1/brands/${brandId}/products`)
        .end((err,res) => {
          res.should.have.status(200);
          res.res.statusMessage.should.be.eq('OK');
          res.body.should.be.an('array')
          res.body.length.should.be.eq(3);
          done();
        });
    });
    /**Test getting a brandId that doesn't exist*/
    it('should fail to get non-existant brandId and return 404', done => {
      const badBrandId = 12;
      chai.request(server)
        .get(`/v1/brands/${badBrandId}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          res.res.statusMessage.should.be.eq('Not Found');
          done();
        });
    });
  });
});

/**Testing API calls related to products */
describe('Products', () => {
  /**Test successfully getting all products */
  describe('/GET products', () => {
    it('should return all available sunglasses', done => {
      chai.request(server)
        .get('/v1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body.length.should.be.eq(11);
        done();
      });
    });
  });
});

/**Testing API calls related to login/logout */
describe('Login/Logout', () => {
  describe('/POST login', () => {
    /**Test successful login */
    it('should succeed with login and return status 200', done => {
      chai.request(server)
        .post('/v1/user/login')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({'username': 'reacher', 'password': 'Roscoe123!'})
        .end((err, res) => {
          res.should.have.status(200);
          res.res.statusMessage.should.be.eq('OK');
          res.body.should.have.property('username','reacher');
          res.body.should.have.property('lastUpdated').that.is.a('string');
          res.body.should.have.property('token').that.is.a('string');
          done();
        });
    });
    /**Test failed login */
    it('should fail login with bad username and return 401', done => {
      chai.request(server)
        .post('/v1/user/login')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({'username': 'baduser', 'password': 'Roscoe123!'})
        .end((err, res) => {
          res.should.have.status(401);
          res.res.statusMessage.should.be.eq('Unauthorized');
          done();
        });
    });
    it('should fail login with bad password and return 401', done => {
      chai.request(server)
        .post('/v1/user/login')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({'username': 'reacher', 'password': 'badpassword'})
        .end((err, res) => {
          res.should.have.status(401);
          res.res.statusMessage.should.be.eq('Unauthorized');
          done();
        });
    });
  });
  describe('/POST logout', () => {
    /**Successful logout */
    it('should logout the user and return 204', done => {
      chai.request(server)
        .post('/v1/user/logout')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({'username': 'reacher', 'password': 'badpassword'})
        .end((err, res) => {
          res.should.have.status(204);
          res.res.statusMessage.should.be.eq('No Content');
          done();
        });
    });
    /**Test for failed logout */
    it('should fail to logout the user if not logged in and return 500', done => {
      chai.request(server)
        .post('/v1/user/logout')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({'username': 'reacher', 'password': 'badpassword'})
        .end((err, res) => {
          res.should.have.status(500);
          res.res.statusMessage.should.be.eq('bad username or password');
          done();
      });
    });
  });
});

/**Testing API calls related to the shopping cart */
describe('Cart', () => {
  describe('/GET', () => {
    /**Test successfully getting cart*/
    it('should successfully return all items in the cart in json and status 200', done => {
      chai.request(server)
        .get('/v1/me/cart')
        .end((err, res) => {
          res.should.have.status(200)
          done();
        });
    });
    /**Test accessing cart not logged in */
    it('should fail if accessing cart unauthenticated and return 401', done => {
      chai.request(server)
        .get('/v1/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe('/POST', () => {
    const testProduct = { productId: '1' };
    /**Test successfully adding an item to the cart*/
    it('should successfully add an item to the cart and return 201', done => {
      chai.request(server)
        .post('/v1/me/cart')
        .send(testProduct)
        .end((err, res) => {
          res.should.have.status(201)
          done();
        });
    });
    /**Test accessing cart not logged in */
    it('should fail if accessing cart unauthenticated and return 401', done => {
      chai.request(server)
        .post('/v1/me/cart')
        .send(testProduct)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    /**Test adding a product already in cart (duplicate item) */
    it('should fail if adding a product already in the cart and return 403', done => {
      //cart.push(testProduct);
      chai.request(server)
        .post('/v1/me/cart')
        .send(testProduct)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
    /**Test adding a product that doesn't exist */
    it('should fail if adding a product that does not exist and return 404', done => {
      chai.request(server)
        .post('/v1/me/cart')
        .send({ productId: '2001' })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });
  describe('/PUT', () => {
    //cart.push({ productId: '1', quantity: '1' });
    /**Test successfully updating an item in cart */
    it('should successfully update an item quantity and return 200', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{ productId: '1', quantity: '2' }}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    /**Test sending a request with missing requirements */
    it('should fail due to missing quantity and return 400', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{ productId: '1' }}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    /**Test accessing cart not logged in */
    it('should fail if accessing cart unauthenticated and return 401', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{ productId: '1', quantity: '1' }}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    /**Test updating an item quantity to 0 */
    it('should fail to update an item quantity to 0 and return 403', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{productId: '1', quantity: '0'}}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
    /**Test updating an item quantity beyond the max */
    it('should fail to update an item quantity beyond 1000 and return 403', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{productId: '1', quantity: '1001'}}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
    /**Test updating an item not in the cart */
    it('should fail if accessing an item that is not in the cart and return 404', done => {
      chai.request(server)
        .put(`/v1/me/cart/${{productId: '2001', quantity: '2'}}`) //TODO: How do you properly put?
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
  describe('/DELETE', () => {
    //cart.push({ productId: '1', quantity: '1' });
    /**Test successfully deleting an item from cart */
    it('should successfully delete an item in the cart', done => {
      chai.request(server)
        .delete(`/v1/me/cart/${{ productId: '1' }}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    /**Test accessing cart not logged in */
    it('should fail if accessing cart unauthenticated and return 401', done => {
      chai.request(server)
        .delete(`/v1/me/cart/${{ productId: '1' }}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    /**Test deleting an item that doesn't exist and return 404 */
    it('should fail if accessing an item that is not in the cart and return 404', done => {
      chai.request(server)
        .delete(`/v1/me/cart/${{ productId: '2001' }}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
