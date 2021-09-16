let Brand = require('./app/models/brand');


let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./server");
const { request } = require('chai');

let should = chai.should();

chai.use(chaiHttp);


// describe('The shopping cart', () => {
//   describe('subtotal should', () => {
//     it('be 0 if no items are passed in', () => {
//       // arrange
//       let shoppingCart = new ShoppingCart();
//       // act
//       let subtotal = shoppingCart.subtotal;
//       // assert
//       assert.equal(subtotal, 0);
//     });
//   });
// });

describe('Brands', () => {
  describe('/GET brand', () => {
    // - Test that passing no query paramter returns back all brands
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
    it('should GET the brand that matches the query parameter', (done) => {
      chai
        .request(server)
        .get('/brands')
        .query({name:'Oakley'})
        .end((err, res) => {
          res.should.have.status(200);

        })
    })
  });
});


// GET /books?q=Harry%20Potter

// GET /brands
// GET /brands?q=Oakley

// Positive:
// - Test if a valid query returns the brand and the sunglasses for that brand
// - Test that passing no query paramter returns back all brands

// Negative:
// - Test is passing an empty value as the 'q' parameter returns an error code
// - Test if passing something invalid as the 'q' parameter (like null) returns an error code
// - Test that if a query has no brands for it returns back an empty