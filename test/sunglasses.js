const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET sunglasses', () => {
    it('should GET all the sunglasses', (done) => {
      chai
        .request(server)
        .get('/sunglasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

describe('User', () => {
  describe('/POST user info', () => {
    it('should return the user info as an object when POST correct login info', (done) => {
      const validLogin = {
        username: 'yellowleopard753',
        password: 'jonjon'
      };

      chai
        .request(server)
        .post('/me')
        .send(validLogin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('cart');
          done();
        });
    });


    it('should return an error when provided with the wrong login credentials', (done) => {
      const invalidCredentials = {
        username: 'yellowleopard753',
        password: 'nope'
      };

      chai
        .request(server)
        .post('/me')
        .send(invalidCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe('Cart', () => {
  describe('/POST sunglasses by ID to cart', () => {
    it('should POST specific sunglasses to cart and update the quantity', (done) => {
      const sunglassesId = '1';

      const cartItemUpdate = {
        sunglassesId: sunglassesId,
        action: 'update_quantity',
        quantity: 5
      };

      chai
        .request(server)
        .post(`/cart/sunglasses/${sunglassesId}/addToCart`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.satisfy((cartItems) => {
            return cartItems.some((item) => item.sunglassesId === sunglassesId && item.quantity === cartItemUpdate.quantity);
          });
          done();
        });
    });

    it('should return an error when provided with a wrong action', (done) => {
      const sunglassesId = '1';

      const cartItemUpdate = {
        sunglassesId: sunglassesId,
        action: 'wrong',
        quantity: 5
      };

      chai
        .request(server)
        .post(`/cart/sunglasses/${sunglassesId}/addToCart`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return an error when provided with a no quantity', (done) => {
      const sunglassesId = '1';

      const cartItemUpdate = {
        sunglassesId: sunglassesId,
        action: 'update_quantity',
        quantity: NaN
      };

      chai
        .request(server)
        .post(`/cart/sunglasses/${sunglassesId}/addToCart`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return an error when provided with a non existent sunglasses ID', (done) => {
      const invalidSunglassesId = '999';

      const cartItemUpdate = {
        sunglassesId: invalidSunglassesId,
        action: 'update_quantity',
        quantity: 5
      };

      chai
        .request(server)
        .post(`/cart/sunglasses/${invalidSunglassesId}/addToCart`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/PUT remove sunglasses by ID', () => {
    it('should remove specific sunglasses from the cart', (done) => {
      const sunglassesId = '1';

      const cartItemUpdate = {
        sunglassesId: sunglassesId,
        action: 'remove'
      };

      chai
        .request(server)
        .put(`/cart/sunglasses/${sunglassesId}/changeQuantity`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.not.satisfy((cartItems) => {
            return cartItems.some((item) => item.sunglassesId === sunglassesId);
          });
          done();
        });
    });

    it('should return an error when provided with a wrong action', (done) => {
      const sunglassesId = '1';

      const cartItemUpdate = {
        sunglassesId: sunglassesId,
        action: 'wrong'
      };

      chai
        .request(server)
        .put(`/cart/sunglasses/${sunglassesId}/changeQuantity`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return an error when provided with a non existent sunglasses ID', (done) => {
      const invalidSunglassesId = '999';

      const cartItemUpdate = {
        sunglassesId: invalidSunglassesId,
        action: 'remove'
      };

      chai
        .request(server)
        .put(`/cart/sunglasses/${invalidSunglassesId}/changeQuantity`)
        .send(cartItemUpdate)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/POST checkout', () => {
    it('should process the checkout and return a confirmation message, total price, and purchased items', (done) => {

      chai
        .request(server)
        .post('/cart/checkout')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('message');
          res.body.message.should.be.a('string');
          res.body.should.have.property('totalPrice');
          res.body.totalPrice.should.be.a('number');
          res.body.should.have.property('purchasedItems');
          res.body.purchasedItems.should.be.an('array');
          done();
        });
    });
  });
});

describe('Brands', () => {
  describe('GET /brands', () => {
    it('should return all brands', (done) => {
      chai.request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(5);
          done();
        });
    });
  });

  describe('GET /brands/:id/products', () => {
    it('should return all products for a specific brand', (done) => {
      const brandId = '1';

      chai.request(server)
        .get(`/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(product => {
            product.categoryId.should.equal(brandId);
          });
          done();
        });
    });

    it('should return an empty array if no products match the brand', (done) => {
      const nonBrandId = '999';

      chai.request(server)
        .get(`/brands/${nonBrandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(0);
          done();
        });
    });
  });
});