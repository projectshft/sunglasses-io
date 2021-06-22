const { expect } = require('chai');
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

beforeEach(async () => {
  JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
  const users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
});

// tests to get all the brands
describe('/GET all the brands', () => {
  it('it should get all the brands', (done) => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.not.have.status(401);
        res.body.should.be.an('object');
        done();
      });
  });
});

describe('/GET products of brand ID', () => {
  it('It should GET all products for given brand id', (done) => {
    chai
      .request(server)
      .get('/api/brands/:brandId/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
  });
});

describe('/GET all the products', () => {
  it('It should GET all the products', (done) => {
    chai
      .request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('POST logging in', () => {
  const inValidLogin = { username: 'greenlion235', password: 'waters' };
  const validLogin = { username: 'greenlion235', password: 'waters' };
  it('It should return a 401 error if incorrect credentails', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(inValidLogin)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should return a access token if login is a success', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .send(validLogin)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

// GET /api/brands passing

// GET /api/brands/:brandId/products

// GET /api/products

// POST /api/login

// GET /api/me/cart

// POST /api/me/cart/:productId

// DELETE /api/me/cart/:productId

//   // tests that it get all the products
//   describe('/GET Products', () => {
//     it('it should GET all the Products', (done) => {
//       chai
//         .request(server)
//         .get('/api/products')
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('array');
//           res.body.length.should.be.eql(11);
//           done();
//         });
//     });
//   });

//   // tests that it gets the cart
//   describe('/GET Cart', () => {
//     it('it should GET all the Cart', (done) => {
//       chai
//         .request(server)
//         .get('/api/me/cart')
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('array');
//           done();
//         });
//     });
//   });

//   // tests that it gets the products with the related id
//   describe('/GET Products', () => {
//     it('it should GET all the Products related to brand id', (done) => {
//       chai
//         .request(server)
//         .get('/api/brands/:brandId/products')
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//   });
// });

// // tests that it can add to cart
// describe('/POST Product', () => {
//   it('should be added to cart', (done) => {
//     chai
//       .request(server)
//       .post('/api/me/cart/:productId')
//       .end((err, res) => {
//         res.should.have.status(200);

//         done();
//       });
//   });
// });
