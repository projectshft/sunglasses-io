const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('./server');

const expect = chai.expect;
const assert = chai.assert;
let should = chai.should();

chai.use(chaiHTTP);

// Endpoint test 1 of 8
describe('GET /api/brands', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

//2 of 8
describe('GET /api/brands/:id/products', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

//3 of 8
describe('GET /api/brands/products', () => {
  it('should GET all products', done => {
    chai
      .request(server)
      .get('/api/brands/products')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
});


//4 of 8
describe('POST /api/login', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});


//5 of 8
describe('GET /api/me/cart', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});


//6 of 8
describe('POST /api/me/cart', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

//7 of 8 
describe('DELETE /api/me/cart/productID', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});


//8 of 8
describe('POST /api/me/cart/productID', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

