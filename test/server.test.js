const server = require('../app/server');

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;
// should = chai.should();
// const expect = chai.expect;
// const assert = chai.assert;
chai.use(chaiHttp);

// // Delay running the tests until after 5s
// setTimeout(function() {
//   run();
// }, 5000);

/***************************************
 *   TEST Empty query: GET / or GET /api
 ***************************************/
describe('Empty queries (/)', () => {
  it('should return a suggestion to redirect to brands or products', done => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });
});
describe('Empty queries (/api)', () => {
  it('should return a suggestion to redirect to brands or products', done => {
    chai
      .request(server)
      .get('/api')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('string');
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
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
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
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(res.body).to.be.an('array');
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
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
});

// /*=================================================
//  *   TEST Specific product: GET /api/products/:id
//  *=================================================*/
// describe('/GET specific product', () => {
//   it('should return the specified product', done => {
//     chai
//       .request(server)
//       .get('/api/products/1')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect('Content-Type', 'application/json');
//         expect(res.body).to.have.keys([
//           'id',
//           'categoryId',
//           'name',
//           'description',
//           'price',
//           'imageUrls'
//         ]);
//         expect(res.body)
//           .to.have.property('id')
//           .that.is.a('string');
//         expect(res.body)
//           .to.have.property('categoryId')
//           .that.is.a('string');
//         expect(res.body)
//           .to.have.property('name')
//           .that.is.a('string');
//         expect(res.body)
//           .to.have.property('description')
//           .that.is.a('string');
//         expect(res.body)
//           .to.have.property('price')
//           .that.is.a('number');
//         expect(res.body)
//           .to.have.property('imageUrls')
//           .that.is.an('array')
//           .with.lengthOf(3);
//         done();
//       });
//   });
// });

/*====================================
 *   TEST User login: POST /api/login
 *====================================*/
describe('/POST login user', () => {
  it('should login the user', done => {
    chai
      .request(server)
      .post('/api/login')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.lengthOf(16);
        expect(res.body).to.be.a('string');
        done();
      });
  });
});

// // Set up the data to pass to the login method
// const userCredentials = {
//   username: 'greenlion235',
//   password: 'waters'
// };
// // Login the user before testing
// var authenticatedUser = request.agent(app);
// before(function(done) {
//   authenticatedUser
//     // Make a POST to the /login route
//     .post('/login')
//     .send(userCredentials)
//     .end(function(err, response) {
//       expect(response.statusCode).to.equal(200);
//       // Make sure the user is directed to /api/me/cart
//       expect('Location', '/api/me/cart');
//       done();
//     });
// });
