// products[i].categoryId = brands[i].id

// let Brands = require('../app/models/brands');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;

const should = chai.should();

chai.use(chaiHttp);
// beforeEach(() => {
//   brands.removeAll();
//   products.removeAll();
// });

// test 1: response is all brands
describe('GET/ brands', () => {
  it('should GET all the sunglasses brands', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect("Content-Type", "application/json");
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      });
  });
});

// test 2: response is all products
describe('GET/ products', () => {
  it('should GET all the sunglasses products', (done) => {
    // act
    chai
      .request(server)
      .get('/api/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect("Content-Type", "application/json");
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
        done();
      });
  });
});

// test 3: uery term is a brand, response is all products of that brand
// describe('GET/ products by brand id', () => {
//   it('should GET all the products associated with a brand of sunglasses', (done) => {
//     // act
//     chai
//       .request(server)
//       .get('/api/brands/1/products')
//       // assert
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect("Content-Type", "application/json");
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(0);
//         done();
//       });
//   });
// });