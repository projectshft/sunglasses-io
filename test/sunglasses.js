let chai = require('chai');
let chaiHttp = require('chai-http');
const { request } = require('http');
const state = require('../app/server.js');
let server = require('../app/server.js');
let products = require('../initial-data/products.json');
let users = require('../initial-data/users.json');
let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {

  describe('/GET brands', () => {
    it('should GET all of the brands offered in the store and return them as an array', done => {
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

  describe('/GET brands/:id/products', () => {
    it('should GET all of the products offered in the store and return them as an array', done => {
      chai
        .request(server)
        .get('/brands/2')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });

});

describe('Products', () => {

  describe('/GET products/', () => {
      it('should return an array of all the sunglasses offered in the store', done => {
        chai
          .request(server)
          .get('/products')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
          });
      });
    });

});

describe('Me', () => {

  beforeEach(() => {
    users.forEach((user) => {
      user.cart = [];
    })
  });

  describe('/POST me/cart/', () => {

    it('should add a given product to the current user\'s cart if the user is logged in', done => {
      // arrange
      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 2;
      })

      const requestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      // act
      chai
        .request(server)
        .post('/me/cart')
        .send(requestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('product');
          res.body.should.have.property('quantity');
          res.body.product.should.be.an('object');
          res.body.product.should.have.property('id');
          res.body.product.should.have.property('categoryId');
          res.body.product.should.have.property('name');
          res.body.product.should.have.property('description');
          res.body.product.should.have.property('price');
          res.body.product.should.have.property('imageUrls');
          done();
        });
    });

    it('should return a 401 error and not add a product to a cart if a user is not logged in', done => {
      // arrange
      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 2;
      })

      const requestInfo = {
        product: product,
        loggedIn: false
      }

      // act
      chai
        .request(server)
        .post('/me/cart')
        .send(requestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

  });

  describe('/DELETE me/cart/:productId', () => {
    it('should remove a given product from current user\'s cart', done => {
      // arrange
      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const deleteRequestInfo = {
        userSha1: userSha1,
        loggedIn: true
      }

      // act
      chai
        .request(server)
        .delete('/me/cart/3')
        .send(deleteRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return a 401 error if a user is not logged in', done => {
      // arrange
      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const deleteRequestInfo = {
        userSha1: userSha1,
        loggedIn: false
      }

      // act
      chai
        .request(server)
        .delete('/me/cart/3')
        .send(deleteRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return a 404 error if the provided product ID does not match an item in the cart', done => {
      // arrange
      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const deleteRequestInfo = {
        userSha1: userSha1,
        loggedIn: true
      }

      // act
      chai
        .request(server)
        .delete('/me/cart/46')
        .send(deleteRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });

  describe('/POST me/cart/:id', () => {
    it('should increase a given product\'s quantity in the current user\'s cart', done => {
      // arrange

      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const incrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: true,
        action: 'increase'
      }

      // act
      chai
        .request(server)
        .post('/me/cart/3')
        .send(incrementRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('product');
          res.body.should.have.property('quantity');
          res.body.quantity.should.eql(2);
          done();
        });
    });

    it('should decrease a given product\'s quantity in the current user\'s cart if the item\'s quantity is 2 or greater', done => {
      // arrange

      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const incrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: true,
        action: 'increase'
      }

      chai.request(server).post('/me/cart/3').send(incrementRequestInfo).end()

      const decrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: true,
        action: 'decrease'
      }

      // act
      chai
        .request(server)
        .post('/me/cart/3')
        .send(decrementRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('product');
          res.body.should.have.property('quantity');
          res.body.quantity.should.eql(1);
          done();
        });
    });

    it('should remove a given product from the current user\'s cart if the item\'s quantity is 1 while leaving other products alone', done => {
      // arrange

      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()

      const anotherProduct = products.find((product) => {
        return product.id == 2;
      })

      const moreAddRequestInfo = {
        product: anotherProduct,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(moreAddRequestInfo).end()

      const decrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: true,
        action: 'decrease'
      }

      // act
      chai
        .request(server)
        .post('/me/cart/3')
        .send(decrementRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.have.length(1);
          done();
        });
    });

    it('should return a 401 error if a user is not logged in', done => {
      // arrange

      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const incrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: false,
        action: 'increase'
      }

      // act
      chai
        .request(server)
        .post('/me/cart/3')
        .send(incrementRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return a 404 error if the provided product ID does not match an item in the cart', done => {
      // arrange

      const userSha1 = 'f9a60bbf8b550c10712e470d713784c3ba78a68e';

      const product = products.find((product) => {
        return product.id == 3;
      })

      const addRequestInfo = {
        product: product,
        userSha1: userSha1,
        loggedIn: true
      }

      chai.request(server).post('/me/cart').send(addRequestInfo).end()
      
      const incrementRequestInfo = {
        userSha1: userSha1,
        loggedIn: true,
        action: 'increase'
      }

      // act
      chai
        .request(server)
        .post('/me/cart/42')
        .send(incrementRequestInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });

})

describe('Login', () => {

  describe('POST login/', () => {

    it('should log the a user in as the current user based on the entered username and password, giving them access to cart functions', done => {
      // arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }
      
      // act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('token')
          res.body.should.have.property('loggedInUser')
          done();
        })
    })

    it('should return a 401 error if the login fails', done => {
      // arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'whoops'
      }
      
      // act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })

    it('should return a 400 error if the one or both of the login parameters are missing', done => {
      // arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: null
      }
      
      // act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })

  });
});
  
  



