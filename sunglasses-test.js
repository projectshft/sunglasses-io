/* eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const { uid } = require('rand-token');
const { send } = require('process');
const { request } = require('http');
const server = require('./app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET brands', () => {
    it('it should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });
  describe('/GET brands/:brandId/products', () => {
    it('it should GET the products from a brand', (done) => {
      chai
        .request(server)
        .get('/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });
    it('it should return an error if there is no brand', (done) => {
      chai
        .request(server)
        .get('/brands/6/products')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          done();
        });
    });
  });
});

describe('Products', () => {
  describe('/GET products', () => {
    it('it should GET all the products', (done) => {
      chai
        .request(server)
        .get('/products')
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
  describe('/POST login', () => {
    it('it should send error if username or password is missing', (done) => {
      const userLogin = {
        username: '',
        password: 'jonjon',
      };
      chai
        .request(server)
        .post('/login')
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('should return error if username or password is wrong', (done) => {
      const userLogin = {
        username: 'yellowleopard753',
        password: 'cheeseburger',
      };
      chai
        .request(server)
        .post('/login')
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('should return access token if login info is correct', (done) => {
      const userLogin = {
        username: 'yellowleopard753',
        password: 'jonjon',
      };
      chai
        .request(server)
        .post('/login')
        .send(userLogin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.length.should.be.eql(16);
          done();
        });
    });
  });
  // having trouble with token and response body throughout
  describe('/GET me/cart', () => {
    it('it returns the users cart', (done) => {
      const userLogin = {
        username: 'yellowleopard753',
        password: 'jonjon',
      };
      let token = '';
      chai
        .request(server)
        .post('/login')
        .send(userLogin)
        .end((err, res) => {
          token = res.body;
        });
      chai
        .request(server)
        .get('/me/cart')
        .set('currentAccessToken', token)
        .end((err, res) => {
          res.body.should.be.an('array');
          done();
        });
    });
    it('it should not return cart of no token present', (done) => {
      const cart = [
        {
          items: [
            {
              brandId: 1,
              qantity: 2,
            },
          ],
        },
      ];
      chai
        .request(server)
        .get('/me/cart')
        .send(cart)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe('/POST /me/cart', () => {
    it('it should add an item to the cart', (done) => {
      const product = {
        productId: 1,
        quantity: 2,
      };
      // let token = '';
      chai
        .request(server)
        .post('/me/cart')
        .set('currentAccessToken', 'WRzWOxryNawJCZwH')
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });
    it('it should not let you add to cart if not logged in', (done) => {
      const currentAccessToken = '';
      if (currentAccessToken == '' || currentAccessToken == undefined) {
        const err = new TypeError(
          'You must be logged in to add an item to your cart'
        );
      }
      const tokenErr = function () {
        throw err;
      };
      chai
        .request(server)
        .post('/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          expect(tokenErr).to.throw(err);
          done();
        });
    });
  });
  describe('/DELETE /me/cart/:productId', () => {
    it('it should delete specific item from cart', (done) => {
      const product = {
        id: 2,
      };
      chai
        .request(server)
        .delete(`/me/cart?productId=${product.id}`)
        .set('currentAccessToken', 'WRzWOxryNawJCZwH')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('/PUT /me/cart/:productId', () => {
    it('it should update item quantity in cart cart', (done) => {
      const product = {
        id: 2,
        quantity: 2,
      };
      chai
        .request(server)
        .delete(`/me/cart?productId=${product.id}`)
        .set('currentAccessToken', 'WRzWOxryNawJCZwH')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
    it('it should not let you edit items in cart if not logged in', (done) => {
      const currentAccessToken = '';
      if (currentAccessToken == '' || currentAccessToken == undefined) {
        const err = new TypeError(
          'You must be logged in to add an item to your cart'
        );
      }
      const tokenErr = function () {
        throw err;
      };
      chai
        .request(server)
        .post('/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          expect(tokenErr).to.throw(err);
          done();
        });
    });
  });
});
