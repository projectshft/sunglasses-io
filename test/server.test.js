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
  it.only('should limit results to those with a query string', done => {
    chai
    .request(server)
    .get('/v1/brands?query=Visit')
    .end((err, res) => {
      assert.isNotNull(res.body)
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1)
    })
  })
  // it.only('returns all goals if query is missing', done => {
  //   chai.request(server)
  //   .get('v1/goals?query=')
  //   .end((err, res) => {
  //     expect(err).to.be.null;
  //     expect(res).to.have.status(200);
  //     expect("Content-Type", "application/json");
  //     expect(res.body).to.be.an("array");
  //     expect(res.body).to.have.lengthOf(5);
  //     done();
  //   })
  // })
})
//GET brands/:id/products test
// describe('/GET products within a brand', () => {
//   it.only('should GET all products from a specific brand', done => {

//   })
// })

// //GET api/products test
// describe('/GET products', () => {
//   it.only('should GET all products', done => {

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