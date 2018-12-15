const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;


chai.use(chaiHTTP);
chai.use(require('chai-sorted'));

//GET /brands test
describe('/GET brands', () => {
  it.only('should GET all brands', done => {
    chai
    .request(server)
    .get('/v1/brands')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(5);
      done();
    })
  })
  it.only('should return a single brand corresponding with the query', done => {
    chai
    .request(server)
    .get('/v1/brands?query=DKNY')
    .end((err, res) => {
      assert.isNotNull(res.body)
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1)
      done();
    })
  })
  it.only('returns all brands if query is missing', done => {
    chai
    .request(server)
    .get('/v1/brands?query=')
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(5);
      done();
    })
  })
  it.only('fails when query is an unrecognized property', done => {
    chai
    .request(server)
    .get('/v1/brands?query=sdtfghjbknm')
    .end((err, res) => {
      expect(err).to.not.be.null;
      expect(res).to.have.status(404);
      done();
    })
  })
})

//GET Products test
describe('/GET products', () => {
  it.only('should GET all products', done => {
    chai
    .request(server)
    .get('/v1/products')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(11);
      done();
    })
  })
  it.only("should limit results to those with a query string based on the product's description", done => {
    //for this test, I made the assumption that the user would search for
    //glasses that fit a description of the glasses they wanted (i.e. if
    //I wanted to find a specific style while not knowing the actual model of the 
    //product)
    chai
      .request(server)
      .get("/v1/products?query=thickest")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only('should fail when query does not yield a product', done => {
    chai
    .request(server)
    .get('/v1/products?query=cfgvhjbkjb')
    .end((err, res) => {
      expect(err).to.not.be.null;
      expect(res).to.have.status(404);
      done();
    })
  })
})
//GET brands/:id/products test
// describe('/GET products', () => {
//   it.only('should GET all products from a specific brand', done => {

//   })
// })

// //POST api/login test
// describe('/POST login', () => {
//   it.only('should allow a user to login', done => {

//   })
// })
// //GET api/me/cart test
// describe('/GET cart', () => {
//   it.only("should GET the currently logged in user's current cart", done => {

//   })
// })
// //POST api/me/cart test
// describe('/POST cart', () => {
//   it.only("should POST an item to the cart", done => {

//   })
// })
// //DELETE api/me/cart/:productId test
// describe('/DELETE product from cart', () => {
//   it.only("should DELETE an existing item from the user's cart", done => {

//   })
// })
// //POST api/me/cart/:productId test
// describe('POST product to cart', () => { 
//   it.only("should update the product amount in the cart", done => {

//   })
// })