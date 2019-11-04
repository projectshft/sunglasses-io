let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);

// GET brands
describe('Brands', () => {
  describe('/GET api/brands', () => {
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
    it('it should GET all the products in initial-data', done => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
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
// holds access token on login for future route tests requiring valid token
let token = '';

describe('Me', () => {
  // GET Cart for current user
  describe('/GET api/me/cart', () => {
    it('should return 401 error if not logged in with valid token', done => {
      chai.request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401)
          res.text.should.eql('401 error: Must be logged in with validated access token to access cart')
          done()
        })
    })
    // logs test user in prior to tests requiring user
    before((done) => {
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
          res.body.length.should.equal(16)
          token = res.body;
          done()
        })
    })
    it('should return products currently in user cart', done => {
      chai.request(server)
        .get(`/api/me/cart?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })
  describe('/POST api/me/cart', () => {
    it('should add a product to user cart', done => {
      let product = {
        "id": "4",
        "brandId": "2",
        "name": "Better glasses",
        "description": "The best glasses in the world",
        "price": 1500,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      chai.request(server)
        .post(`/api/me/cart?accessToken=${token}`)
        .send(product)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object');
          res.body.should.have.property('id')
          res.body.should.have.property('brandId')
          res.body.should.have.property('name')
          res.body.should.have.property('description')
          res.body.should.have.property('price')
          res.body.should.have.property('imageUrls')
          res.body.should.have.property('quantity')
          res.body.quantity.should.be.eql(1)
          done()
        })
    })
    it('should return 401 error when trying to add to cart with invalid access token', done => {
      let product = {
        "id": "4",
        "brandId": "2",
        "name": "Better glasses",
        "description": "The best glasses in the world",
        "price": 1500,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      chai.request(server)
        .post(`/api/me/cart?accessToken=asdf`)
        .send(product)
        .end((err, res) => {
          res.should.have.status(401)
          res.text.should.eql('401 error: Must be logged in with validated access token to access cart')
          done()
        })
    })
    
  })
  describe('/DELETE api/me/cart/:id', () => {
    it('should error 404 if product not found in cart', done => {

      chai.request(server)
        .delete(`/api/me/cart/422?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404)
          res.text.should.be.eql('404: Requested product to delete not found in cart')
          done()
        })
    })
    it('should delete product from user cart', done => {
      chai.request(server)
        // ID '4' is product added to cart in earlier test
        .delete(`/api/me/cart/4?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array');
          res.body.length.should.eql(0)
          done()
        })
    })
    it('should return 401 error when trying to delete from cart with invalid access token', done => {
      chai.request(server)
        .delete(`/api/me/cart/4?accessToken=asdf`)
        .end((err, res) => {
          res.should.have.status(401)
          res.text.should.eql('401 error: Must be logged in with validated access token to access cart')
          done()
        })
    })
  })
})