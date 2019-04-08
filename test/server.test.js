const server = require('../app/server');

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;

chai.use(chaiHttp);

// // Delay running the tests until after 10s
// setTimeout(function() {
//   run();
// }, 10000);

/***************************************
 *   TEST Empty query: GET / or GET /api
 ***************************************/
describe('Empty queries (/)', () => {
  it.skip('should return a suggestion to redirect to brands or products', done => {
    chai
      .request(server)
      .get('/')
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        done();
      });
  });
});
describe('Empty queries (/api)', () => {
  it.skip('should return a suggestion to redirect to brands or products', done => {
    chai
      .request(server)
      .get('/api')
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('string');
        done();
      });
  });
});

/*==================================
 *   TEST Brands: GET /api/brands
 *==================================*/
describe('/GET brands', () => {
  it('should return all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});

/*==============================================================
 *   TEST Products by brand: GET api/brands/id:/products
 *==============================================================*/
describe('/GET products by brand', () => {
  it('should return all products of the specified brand', done => {
    chai
      .request(server)
      .get('/api/brands/:id/products')
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(response.body).to.be.an('array');
        done();
      });
  });
});

/*=====================================
 *   TEST Products: GET /api/products
 *=====================================*/
describe('/GET products', () => {
  it('should return all products of all brands', done => {
    chai
      .request(server)
      .get('/api/products')
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.lengthOf(11);
        done();
      });
  });
});

/*====================================
 *   TEST User login: POST /api/login
 *====================================
    REVISED VERSION
-------------------------------------*/
describe('/POST user login', () => {
  it('should succeed if username and password are both valid', done => {
    chai
      .request(server)
      .post('/api/login')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ username: 'username', password: 'password' })
      .end((error, response) => {
        // expect(200);
        expect(response).to.have.status(200);
        expect('Content-Type', /json/);
        expect(function(response) {
          expect(response.body).not.to.be.empty;
          // expect(response.body).to.be.an('object');
        });
        done();
      });
  });
});
