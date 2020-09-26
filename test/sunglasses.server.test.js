const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;

const should = chai.should();

chai.use(chaiHttp);

//GET BRANDS
describe('GET/ brands', () => {
  // test: response is all brands
  it('should GET all the sunglasses brands', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(6);
        done();
      });
  });

  it('should ERROR if there are no brands', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands_empty')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });
});

//GET PRODUCTS BY BRAND ID
describe('GET/ products by brand Id', () => {
  // test: response is all brands
  it('should GET all the products from one brand of sunglasses', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands/1/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });

  it('should ERROR if brand does not exist', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands/100/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204); 
        done();
      });
  });

  it('should ERROR if no products are found for the brand', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands/6/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204); 
        done();
      });
  });

});

//GET PRODUCTS
describe('GET/ products by a query term', () => {
  // test: get products by a query term
  it('should limit results to those with a query string', (done) => {
    // act
    chai
      .request(server)
      .get('/api/products/Peanut Butter')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it('should ERROR if no product matches query string', (done) => {
    // act
    chai
      .request(server)
      .get('/api/products/Cats')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  // TO WORK ON
  // it('should be case insensitive') .get ('api/products/peanut butter')
  // it('should return multiple products if they match the query string', (done) => {
  //   // act
  //   chai
  //     .request(server)
  //     .get('/api/products/glas')
  //     // assert
  //     .end((err, res) => {
  //       assert.isNotNull(res.body);
  //       expect(err).to.be.null;
  //       expect('Content-Type', 'application/json');
  //       res.should.have.status(200);
  //       res.body.should.be.an('array');
  //       res.body.length.should.be.eql(1);
  //       done();
  //     });
  // });
});

//NOT DONE
// describe('POST/ user login', () => {
//   it('should allow existing users to login', (done) => {
//     // act
//     chai
//       .request(server)
//       .get('/api/login/yellowleopard753/jonjon')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(1);
//         done();
//       });
//   });

  // TO WORK ON: Allow 3 mistakes before locking out
//   it('should throw an error when invalid username/pswd combination entered', (done) => {
//     // act
//     chai
//       .request(server)
//       .get('/api/login/MissMaddie/jonjon')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(400);
//         // res.body.should.be.an('array');
//         // res.body.length.should.be.eql(1);
//         done();
//       });
//   });
// });

//NOT DONE
// describe('GET/ currentUser cart', () => {
//   // test: response is all brands
//   it('should GET the cart contents for currentUser', (done) => {
//     // act
//     chai
//       .request(server)
//       .get('/me/cart')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });

//   it('should FAIL if currentUser is not logged in', (done) => {
//     // act
//     chai
//       .request(server)
//       .get('/me/cart')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });
// });

//NOT DONE
// describe('POST/ a new item to currentUser cart', () => {
//   // test: response is all brands
//   it('should POST a new product to the currentUser cart', (done) => {
//     // act
//     chai
//       .request(server)
//       .post('/me/cart/1')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });
// });

//NOT DONE
// describe('DELETE/ an item from currentUser cart', () => {
//   // test: response is all brands
//   it('should DELETE an item from currentUser cart', (done) => {
//     // act
//     chai
//       .request(server)
//       .delete('/me/cart/1')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });

//   it('should FAIL if currentUser is not logged in', (done) => {
//     // act
//     chai
//       .request(server)
//       .delete('/me/cart/1')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });
// });

// describe('POST/ a new quantity of an item in currentUser cart', () => {
//   // test: response is all brands
//   it('should POST a new quantity of an item in currentUser cart', (done) => {
//     // act
//     chai
//       .request(server)
//       .post('/me/cart/1/4')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });

//   it('should FAIL if currentUser is not logged in', (done) => {
//     // act
//     chai
//       .request(server)
//       .post('/me/cart/1/4')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect('Content-Type', 'application/json');
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(5);
//         done();
//       });
//   });
// });
