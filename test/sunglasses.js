let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);


// GET brands
describe('Brands', () => {
  describe('/GET api/brands', () => {
    // Acting
    it('it should GET all the brands in initial-data', done => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  })
  // GET Products by BrandId
  describe('/GET api/brands/:id/products', () => {
    // Acting
    it('it should GET all products for a brand', done => {
      chai.request(server)
        // Getting Burberry brand products
        .get('/api/brands/5/products')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          res.body[0].name.should.be.eql('Peanut Butter')
          res.body[1].name.should.be.eql('Habanero')
          done();
        })
    })
    it('it should return 404 error when brandID not found', done => {
      chai.request(server)
        .get('/api/brands/99999999999/products')
        .end((err, res) => {
          // Asserting
          res.should.have.status(404);
          res.text.should.be.a('string')
          res.text.should.equal("404 Error: Brand ID not found.")
          done();
        })
    })
  })
})

// GET Products
describe('Products', () => {
  describe('/GET api/products', () => {
    // Acting
    it('it should GET all the products in initial-data', done => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
    it('it should GET a product by name matching exact query', done => {
      chai.request(server)
        .get('/api/products?query=Peanut%20Butter')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql('Peanut Butter')
          done();
        })
    })
    it('it should GET all products by name that contain the query(case INsensitive)', done => {
      chai.request(server)
        .get('/api/products?query=superglasses')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body[0].name.should.be.eql('Superglasses')
          done();
        })
    })
    it('it should GET all products by name OR description that contain the query', done => {
      chai.request(server)
        .get('/api/products?query=spiciest')
        .end((err, res) => {
          // Asserting
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body[0].name.should.be.eql('Habanero')
          done();
        })
    })
    it('it should return 404 error when no products found matching query', done => {
      chai.request(server)
        .get('/api/products?query=sasdfas')
        .end((err, res) => {
          // Asserting
          res.should.have.status(404);
          res.text.should.be.a('string')
          res.text.should.equal("404 Error: No products found.")
          done();
        })
    })
  })
})

// POST login
describe('Login', () => {
  describe('/POST api/login', () => {
    it('should return status 200 and return an access token on succesful login', done => {
      chai.request(server)
        .post('/api/login')
        .set({
          'Content-Type': 'application/json'
        })
        .send({
          email: 'susanna.richards@example.com',
          password: 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('string')
          res.body.length.should.be.eql(16)
          done()
        })
    })
    it('should return 401 error on improper credentials', done => {
      chai.request(server)
        .post('/api/login')
        .set({
          'Content-Type': 'application/json'
        })
        .send({
          email: 'asdf@fake.com',
          password: '11111111'
        })
        .end((err, res) => {
          res.should.have.status(401)
          res.text.should.be.a('string')
          res.text.should.be.eql('401 Error: username and/or password incorrect')
          done()
        })
    })
    it('should return 400 error on missing email and/or password', done => {
      chai.request(server)
        .post('/api/login')
        .set({
          'Content-Type': 'application/json'
        })
        .send({
          email: '',
          password: ''
        })
        .end((err, res) => {
          res.should.have.status(400)
          res.text.should.be.a('string')
          res.text.should.be.eql('400 Error: Email & Password must not be empty')
          done()
        })
    })
  })
})

describe('Me', () => {
  // GET Cart for current user
  describe('/GET api/me/cart', () => {
    it('should return products currently in cart', done => {
      chai.request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })
})