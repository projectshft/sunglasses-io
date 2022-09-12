const chai = require('chai');
const chaiHttp = require('chai-http');
const { uid } = require('rand-token');
const { access } = require('fs');
const Store = require('../app/store');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('brands', () => {
  describe('/GET brands', () => {
    it('it should return an array of brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('/GET brands/:id/products', () => {
    it('it should return an array of products for the specified brand id', (done) => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach((product) => {
            product.should.have.property('id');
            product.should.have.property('categoryId');
            product.should.have.property('name');
            product.should.have.property('description');
            product.should.have.property('price');
            product.should.have.property('imageUrls');
          });
          done();
        });
    });
  });
  it('it should not return anything if there is no brand for the specified id', (done) => {
    chai
      .request(server)
      .get('/api/brands/notaproductroute/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe('products', () => {
  describe('/GET products', () => {
    it('it should return an array of products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach((product) => {
            product.should.have.property('id');
            product.should.have.property('categoryId');
            product.should.have.property('name');
            product.should.have.property('description');
            product.should.have.property('price');
            product.should.have.property('imageUrls');
          });
          done();
        });
    });
    it('it should be able to be queried for the name of the products in the array', (done) => {
      chai
        .request(server)
        .get('/api/products?query=glasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach((product) => {
            product.name.toLowerCase().should.contain('glasses');
          });
          done();
        });
    });
    it("it should return an error if there is no product found matching the user's query", (done) => {
      chai
        .request(server)
        .get('/api/products?query=notAMatchingQuery')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.equal([]);
          done();
        });
    });
  });
});

describe('login', () => {
  describe('/POST login', () => {
    it('it should return a token when passed valid login username and passwords', (done) => {
      const credentials = {
        username: 'yellowleopard753',
        password: 'jonjon',
      };
      chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
          res.body.length.should.be.eql(16);
          done();
        });
    });
    it('it should return an error when not sent a password', (done) => {
      const invalidCredentials = {
        username: 'yellowleopard753',
      };
      chai
        .request(server)
        .post('/api/login')
        .send(invalidCredentials)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('it should return an error when not sent  a username', (done) => {
      const invalidCredentials = {
        password: 'jonjon',
      };
      chai
        .request(server)
        .post('/api/login')
        .send(invalidCredentials)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('it should return an error when sent invalid login information', (done) => {
      const invalidCredentials = {
        username: 'notARealUsername',
        password: 'notevenapassowrd',
      };
      chai
        .request(server)
        .post('/api/login')
        .send(invalidCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe('User cart', () => {
  let accessToken = '';
  beforeEach((done) => {
    const credentials = {
      username: 'yellowleopard753',
      password: 'jonjon',
    };
    chai
      .request(server)
      .post('/api/login')
      .send(credentials)
      .end((err, res) => {
        accessToken = res.body;
        done();
      });
  });

  describe('/GET user cart', () => {
    it("it should return an array of products in the user's cart when the user is logged in and the cart is empty", (done) => {
      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
    it('it should return an error if the user is not authenticated', (done) => {
      chai
        .request(server)
        .get(`/api/me/cart?accessToken=notAValidToken`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
