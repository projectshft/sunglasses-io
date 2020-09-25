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
//   Sunglasses.removeAll();
// });

// test 1
describe('GET/ brands', () => {
  console.log('test 1: get all brands');
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
        res.body.length.should.be.eql(0);
        done();
      });
  });
});

// test2
describe('GET/ products', () => {
  console.log('test 2: get all products');
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
        res.body.length.should.be.eql(0);
        done();
      });
  });
});