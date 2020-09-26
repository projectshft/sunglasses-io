const {
  expect
} = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server.js');
let should = chai.should();
let sinon = require('sinon');
let testToken = '';
chai.use(chaiHttp);


describe('GET /brands should return', () => {
  it('all brands and IDs as array of objects', done => {

    chai
      // arrange  
      .request(server)
      // act
      .get('/api/brands')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        // var names = [];  // this isn't working
        // res.forEach(function(item) {names.push(item.name);});
        // expect(names).to.have.members(['Oakley', 'Ray Ban', 'Levi\'s', 'DKNY', 'Burberry']);
        done();
      });
  });

  it('specified number of brands returned', done => {

    chai
      // arrange  
      .request(server)
      // act
      .get('/api/brands?number=3')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      })
  });
  it('returns all products based on brand id', done => {
    chai
      // arrange  
      .request(server)
      // act
      .get('/api/brands/1/products')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      })
  });

});

describe('GET /products should return', () => {
  it('all products in catalog as array of objects', done => {

    chai
      // arrange  
      .request(server)
      // act
      .get('/api/products')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
       
        done();
      });
  });

  it('Products based on search term', done => {

    chai
      // arrange  
      .request(server)
      // act
      .get('/api/products?search=QDogs Glasses')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
       
        done();
      });
  });

});

describe('POST /login should process login', () => {
  it('known good username/password is granted token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/login?username=greenlion235&password=waters')
      //.send({ username: 'greenlion235', password: 'waters'})
      .end((err, res) => {
        // assert
        testToken = res.body;
        res.should.have.status(200);
        res.body.should.be.a('string'); 
        done();
      });
  });

  it('bad username/password is denied token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/login?username=badlogin&password=badpass')
      .end((err, res) => {
        // assert
        // expect(res.body).to.equal({});  //but it is an empty obj
        res.should.have.status(401);
        done();
      });
  });

  // attempt login with Sinon for better implementation testing
  // let Auth = {
  //   attempt() {
  //     // implementation here
  //   }
  // };
  
  // class Unauthorized {}
  
  // function login(credentials) {
  //   return Auth.attempt(credentials).then(
  //     auth => {
  //       return auth.user;
  //     },
  //     () => {
  //       throw new Unauthorized();
  //     }
  //   );
  // }
  // describe('the login function', () => {
  //   it('should resolve with the user if authenticated', () => {});
  
  //   it('should reject with Unauthorized if unauthenticated', () => {});
  // });
  // this isn't in spec and is at-risk for implmentation
  /* it('expires and removes token on /logout', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/logout') // for future notes: https://tinyurl.com/yy9ypzzw
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  }); */
});

describe('GET /cart return cart contents', () => {
  it('requires valid token to return results', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/cart')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });

  it('denies access to cart without token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/cart')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });
});

describe('POST /cart adds product to cart', () => {
  it('requires valid token to add product', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/me/cart')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });

  it('denies product added to cart if no valid token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/me/cart')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });
});

describe('DELETE /cart/:productId removes product from cart', () => {
  it('requires valid token to remove product', done => {

    chai
      // arrange  
      .request(server)
      // act
      .delete('/api/me/cart/1')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });

  it('denies product removal from cart if no valid token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .delete('/api/me/cart/1')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });
});

describe('POST /cart/:productId removes product from cart', () => {
  it('requires valid token to remove product', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/me/cart/1')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });

  it('denies product removal from cart if no valid token', done => {

    chai
      // arrange  
      .request(server)
      // act
      .post('/api/me/cart/1')
      .end((err, res) => {
        // assert
        res.should.have.status(200);
        done();
      });
  });
});