let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');

let should = chai.should();
let accessToken = '';

chai.use(chaiHttp);

//desribe the products
describe('Products', () => {
  //describe the get call of the products
  describe('GET products', () => {
    //it for what GET products should do
    it('should return all products', done => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return product based on query', done => {
      chai
        .request(server)
        .get('/products?query=Black')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.eql(1); //another way to check length
          done();
        });
    });
    it('should return all products if query param is empty', done => {
      chai
        .request(server)
        .get('/products?query=')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return 404 if no product matches the query', done => {
      chai
        .request(server)
        .get('/products?query=ponies')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});

//describe the brands
describe('Brands', () => {
  //describe the Brands GET
  describe('GET brands', () => {
    //it for what Get brands should do
    it('should return all brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(5);
          done();
        });
    });
    //describe GET products by brand ID
    describe('by brandId/products', () => {
      //it for what the describe should do
      it('should return all products matching brand ID', done => {
        chai
          .request(server)
          .get('/brands/2/products')
          .end((error, response) => {
            response.should.have.status(200);
            response.body.should.be.an('array');
            response.body.should.have.length(2);
            done();
          });
      });
      it('should return 404 if the brand ID does not exist', done => {
        chai
          .request(server)
          .get('/brands/7/products')
          .end((error, response) => {
            response.should.have.status(404);
            done();
          });
      });
    });
  });
});

//describe the login
describe('Login POST', () => {
  //describe with a valid username/pw
  describe('with a valid username and password', () => {
    //should create a new acces token if none exist
    it('should create a new access token if none exist', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200);
          accessToken = response.body;
          done();
        });
    });
    //should use an old access token if one exists
    it('should use an old access token if one exists', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200);
          accessToken = response.body;
          done();
        });
    });
  });
  //it for what should happen if username is left blank
  it('should return 400 if username is left blank', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: '', password: 'jonjon' })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });
  //it for what should happen if password is left blank
  it('should return 400 if password is left blank', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: '' })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });
  //it for what should happen if the username is wrong
  it('should return 401 if username is wrong', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'ye', password: 'jonjon' })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
  //it for what should happen if the password is wrong
  it('should return 401 if password is wrong', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'w' })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
});

//describe the /me/cart
describe('/me/cart', () => {
  //describe the car GEt
  describe('GET cart', () => {
    //what should happen
    it('should return the cart of the current user', done => {});
  });
});
