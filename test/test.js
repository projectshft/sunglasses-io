let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET brands', () => {
    it('It should GET all the brands in the store', (done) => {
      chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        res.body[0].should.have.keys('id', 'name');
        should.not.exist(err);
        done();
        });
    });
  });
  describe('/GET api/brands/:id/products', () => {
    it('It should GET all products for given brand id', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          should.not.exist(err);
          done();
        });
    })
    it('It should return 404 for an invalid brand id', done => {
      chai
        .request(server)
        .get('/api/brands/x/products')
        .end((err, res) => {
          res.should.have.status(404);
          should.not.exist(err);
          done();
        });
    })
  });
});
describe('Products', () => {
  describe('/GET products', () => {
    it('It should GET all the products in the store', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          should.not.exist(err);
          done();
        });
    });
    it('It should limit product results to those in which description contains the querry string', (done) => {
      chai
        .request(server)
        .get('/api/products?query=best')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(4);
          should.not.exist(err);
          done();
        });
    });
    it('It should return all products if query is empty', (done) => {
      chai
        .request(server)
        .get('/api/products?query=')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 404 if query term does not exist in any store descriptions', (done) => {
      chai
        .request(server)
        .get('/api/products?query=dog')
        .end((err, res) => {
          res.should.have.status(404);
          should.not.exist(err)
          done();
        });
    })
  });
});
describe('Login', () => {
  describe('/POST /api/me/login', () => {
    let testUserInvalid = {
      username: 'lazywolf342',
      password: 'wrongPassword'
    };
    let testUserInvalid2 = {
      username: 'lazywolf342',
    };
    let testUserValid = {
      username: 'lazywolf342',
      password: 'tucker'
    };
    it('It should return accesstoken with valid login', (done) => {
      chai
        .request(server)
        .post('/api/me/login')
        .send(testUserValid)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.length.should.be.eql(16);
          should.not.exist(err);
          done();
        });
    });
    it('It should return accesstoken if < 3 invalid logins are attempted', (done) => {
      chai
        .request(server)
        .post('/api/me/login')
        .send(testUserInvalid)
        .send(testUserValid)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.length.should.be.eql(16);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 400 error if missing login parameter', (done) => {
      chai
        .request(server)
        .post('/api/me/login')
        .send(testUserInvalid2)
        .end((err, res) => {
          res.should.have.status(400);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 401 error if invalid login parameter', (done) => {
      chai
        .request(server)
        .post('/api/me/login')
        .send(testUserInvalid)
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 401 error if > 3 invalid logins are attempted', (done) => {
      chai
        .request(server)
        .post('/api/me/login')
        .send(testUserInvalid, testUserInvalid, testUserInvalid, testUserValid)
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
    });
  });
});
describe('Cart', () => {
  let accessToken = '';
  before('login a user', () => {
    let testUserValid = {username: 'yellowleopard753', password: 'jonjon'};
    chai
      .request(server)
      .post('/api/me/login')
      .send(testUserValid)
      .end((err, res) => {
        accessToken = res.body;
      });
  });
  describe('/GET /api/me/cart', () => {
    it('It should GET a logged-in users shopping cart', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .set('accessToken', accessToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eq(0);
          should.not.exist(err);
          done();
        });
      });
    it('It should return 401 if request is made withiout an accesstoken', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
      });
    it('It should return 401 if request is made with invalid accesstoken', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .set('accessToken', '12345')
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
      });
    });
  describe('/POST /api/me/cart', () => {
    let validProduct = {
      productId: 1,
    };
    let invalidProduct = {
      productId: 100,
    };
    it('It should POST a product to a logged-in users shopping cart', (done) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('accessToken', accessToken)
        .send(validProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eq(1);
          should.not.exist(err)
          done();
        });
      });
      it('It should increase product quantity by 1 if product already exists in user cart', (done) => {
        chai
          .request(server)
          .post('/api/me/cart')
          .set('accessToken', accessToken)
          .send(validProduct)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eq(1);
            res.body[0].quantity.should.be.eql(2);
            should.not.exist(err)
            done();
          });
        });
    it('It should return 401 if request is made withiout an accesstoken', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .send(validProduct)
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 401 if request is made with invalid accesstoken', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .send(validProduct)
        .set('accessToken', '12345')
        .end((err, res) => {
          res.should.have.status(401);
          should.not.exist(err);
          done();
        });
    });
    it('It should return 404 if request is made with invalid product', (done) => {
      chai
      .request(server)
      .post('/api/me/cart')
      .set('accessToken', accessToken)
      .send(invalidProduct)
      .end((err, res) => {
        res.should.have.status(404);
        should.not.exist(err);
        done();
        });
    });
  });
  describe('/POST /api/me/cart/:productId', () => {
      it('It should POST an item, updating item quantity for logged-in users shopping cart', (done) => {
        chai
          .request(server)
          .post('/api/me/cart/1?quantity=5')
          .set('accessToken', accessToken)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(1);
            res.body[0].quantity.should.be.eql(5);
            should.not.exist(err);
            done();
          });
        })
        it('It should return 404 for invalid productId', (done) => {
          chai
            .request(server)
            .post('/api/me/cart/100?quantity=5')
            .set('accessToken', accessToken)
            .end((err, res) => {
              res.should.have.status(404);
              should.not.exist(err)
              done();
            });
          })
          it('It should return 404 for quantity < 1', (done) => {
            chai
              .request(server)
              .post('/api/me/cart/1?quantity=-5')
              .set('accessToken', accessToken)
              .end((err, res) => {
                res.should.have.status(404);
                should.not.exist(err)
                done();
              });
            })
            it('It should return 404 for invalid quantity format', (done) => {
              chai
                .request(server)
                .post('/api/me/cart/1?quantity=dog')
                .set('accessToken', accessToken)
                .end((err, res) => {
                  res.should.have.status(404);
                  should.not.exist(err)
                  done();
                });
              })
          it('It should return 401 if request is made withiout an accesstoken', (done) => {
            chai
              .request(server)
              .post('/api/me/cart/1?quantity=5')
              .end((err, res) => {
                res.should.have.status(401);
                should.not.exist(err)
                done();
              });
            })
          it('It should return 401 if request is made with invalid accesstoken', (done) => {
            chai
              .request(server)
              .post('/api/me/cart/1?quantity=5')
              .set('accessToken', '12345')
              .end((err, res) => {
                res.should.have.status(401);
                should.not.exist(err)
                done();
              });
            })
      })
  describe('/DELETE /api/me/cart/:productId', () => {
    it('It should DELETE a product by Id for a logged in user', (done) => {
      chai
        .request(server)
        .delete('/api/me/cart/1')
        .set('accessToken', accessToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          should.not.exist(err)
          done();
        });
      })
      it('It should return 404 for invalid productId', (done) => {
        chai
          .request(server)
          .delete('/api/me/cart/dog')
          .set('accessToken', accessToken)
          .end((err, res) => {
            res.should.have.status(404);
            should.not.exist(err)
            done();
          });
        })
        it('It should return 404 for valid productId where product is not in users cart', (done) => {
          chai
            .request(server)
            .delete('/api/me/cart/2')
            .set('accessToken', accessToken)
            .end((err, res) => {
              res.should.have.status(404);
              should.not.exist(err)
              done();
            });
          })
        it('It should return 401 if request is made withiout an accesstoken', (done) => {
          chai
            .request(server)
            .delete('/api/me/cart/1')
            .end((err, res) => {
              res.should.have.status(401);
              should.not.exist(err)
              done();
            });
          })
        it('It should return 401 if request is made with invalid accesstoken', (done) => {
          chai
            .request(server)
            .delete('/api/me/cart/1')
            .set('accessToken', '12345')
            .end((err, res) => {
              res.should.have.status(401);
              should.not.exist(err)
              done();
            });
          })
    })
})

