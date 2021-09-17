let Brand = require('./app/models/brand');
let User = require('./app/models/user');


let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./server");
const { request } = require('chai');

let should = chai.should();

chai.use(chaiHttp);

const userCredentials = {
  username: 'yellowleopard753',
  password: 'jonjon'
};

// TODOS

describe('Brands', () => {
  describe('/GET brand', () => {
    // - Test that /brands returns all the brands, formatted in an array.
    it('should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
    // - Test if passing in an invalid id returns an error code
    it('should return an error code if an invalid ID is passed as the q parameter', (done) => {
      chai
        .request(server)
        .get('/brands/8/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  });
});

describe('Products', () => {
  describe('/GET products', () => {
    // - Test that /products should return all the products in an array
    it('should GET all the products', (done) => {
      chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });

});

describe('User', () => {
  describe('/POST user', () => {
    // - Test that a user should be able to log in
    it('should return an access token', (done) => {
      chai  
        .request(server)
        .post('/api/login')
        // .set('content-type', 'application/x-www-form-urlencoded')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        })
    })
  })

})


// GET /books?q=Harry%20Potter

// GET /brands
// GET /brands?q=Oakley

// Positive:
// - Test if a valid query returns the brand and the sunglasses for that brand
// - Test that passing no query paramter returns back all brands

// Negative:
// - Test if passing something invalid as the 'q' parameter (like null) returns an error code
// - Test that if a query has no brands for it returns back an empty 

// Return user.name.first and user.name.last
          // return string `Hello, ${} ${}'
          // res.body.should.be.a('string');