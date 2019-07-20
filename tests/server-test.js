let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
       
    });
});

//testing for endpoint 2
describe('/GET brands/:id/products', () => {
  //test for successful response given brand id 1
  it('it should GET all of the products by a given brand id', done => {
    chai
      .request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });
  //test for unsuccessful response when brand id isn't present
  it('it should get a 404 response when the id is not found', done => {
    chai
      .request(server)
      .get('/api/brands/8/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
})

//test for products endpoint
describe('/GET products', () => {
 //test for successful response based on search query provided
 it('it should GET matching pairs of sunglasses based upon provided query', done => {
   chai
    .request(server)
    .get('/api/products?query=sugar')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eql(1);
      done();

    })
 });
 it('it should get a 404 response if no matches to provided query are found', done => {
   chai
    .request(server)
    .get('/api/products?query=bananas')
    .end((err, res) => {
      res.should.have.status(404);
      done();
    })
 });
 it('it should get a 400 response if query is not provided', done => {
   chai
    .request(server)
    .get('/api/products')
    .end((err, res) => {
      res.should.have.status(400);
      done();
    })
 })
 it('it should get a 400 response if query is not formatted correctly', done => {
   chai
    .request(server)
    .get('/api/products?querysugar')
    .end((err, res) => {
      res.should.have.status(400);
      done();
    })
 });
});
 //tests for log in endpoint
 describe('/POST login', () => {
 it('it should get a token object returned if email and password are correct', done => {
   chai
   .request(server)
   .post('/api/login')
   .send({email: "salvador.jordan@example.com", password: "tucker"})
   .end((err, res) => {
     res.should.have.status(200);
     res.should.be.an('object');
     console.log(res.body);
     res.body.should.have.property('token');
     done();
   })

 });
 });
