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
        res.body.length.should.be.eql(5);
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

  it('should return all products if no product matches query string', (done) => {
    // act
    chai
      .request(server)
      .get('/api/products/Cats')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
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

describe('POST/ user login', () => {
  it('should allow existing users to login', (done) => {
    // act
    chai
      .request(server)
      .get('/api/login/yellowleopard753/jonjon')
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

  // TO WORK ON: Allow 3 mistakes before locking out
  it('should throw an error when invalid username/pswd combination entered', (done) => {
    // act
    chai
      .request(server)
      .get('/api/login/MissMaddie/jonjon')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        // res.body.should.be.an('array');
        // res.body.length.should.be.eql(1);
        done();
      });
  });

})


describe