const chai = require('chai');
const chaiHttp = require('chai-http');
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
  describe('/POST user cart', () => {
    afterEach(async () => {
      await chai
        .request(server)
        .delete(`/api/me/cart/1?accessToken=${accessToken}`);
    });
    it('it should update the user cart with the product sent', (done) => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send({ id: '1' })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  it('it should return an error when no product id is sent', (done) => {
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${accessToken}`)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  it('it should return an error when the id of the product is not found', (done) => {
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${accessToken}`)
      .send({ id: 'notARealId' })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('it should return an error if the user is not authenticated', (done) => {
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=notARealToken`)
      .send({ id: '1' })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

describe('User cart by product id', () => {
  let accessToken = '';
  beforeEach(async () => {
    const credentials = {
      username: 'yellowleopard753',
      password: 'jonjon',
    };
    await chai
      .request(server)
      .post('/api/login')
      .send(credentials)
      .then((res) => {
        accessToken = res.body;
      });
    await chai
      .request(server)
      .post(`/api/me/cart?accessToken=${accessToken}`)
      .send({ id: '1' });
  });

  afterEach(async () => {
    await chai
      .request(server)
      .delete(`/api/me/cart/1?accessToken=${accessToken}`);
  });

  describe('/DELETE cart by product id', () => {
    it('it should remove an item from logged in user cart', (done) => {
      chai
        .request(server)
        .delete(`/api/me/cart/1?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('it should return an error if the user is not logged in', (done) => {
      chai
        .request(server)
        .delete(`/api/me/cart/1?accessToken=notAValidToken`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('it should return an error if there if no item in the cart with that id', (done) => {
      chai
        .request(server)
        .delete(`/api/me/cart/5?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
  describe('/POST cart by product id', () => {
    it('it should update the quantity of the item in the cart of a logged in user', (done) => {
      const amountToUpdate = 5;
      chai
        .request(server)
        .post(`/api/me/cart/1?accessToken=${accessToken}`)
        .send({ quantity: amountToUpdate })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.equal(amountToUpdate);
          done();
        });
    });
    it('it should return an error if the user is not logged in', (done) => {
      const amountToUpdate = 5;
      chai
        .request(server)
        .post(`/api/me/cart/1?accessToken=notARealToken`)
        .send({ quantity: amountToUpdate })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('it should return an error if the product id is not found in the user cart', (done) => {
      const amountToUpdate = 5;
      chai
        .request(server)
        .post(`/api/me/cart/4123125?accessToken=${accessToken}`)
        .send({ quantity: amountToUpdate })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
