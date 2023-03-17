let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);
let {expect, assert} = require("chai");
let server = require("./app/server");
let fs = require("fs");

let brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf-8'));
let products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf-8'));
let users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));


describe('/GET All brands', () => {
  it('should show all the brands', (done) => {
    chai.request(server)
    .get('/api/brands')
    .end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.an('array');
      done();
    });
  });
});

describe('/GET All products from a specific brand', () => {
  it('should show all products from a specific brand', (done) => {
    chai.request(server)
    .get('/api/brands/1/products')
    .end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.an('array');
      done();
    });
  });
});


describe('/GET All products', () => {
  it('should show all the products', (done) => {
    chai.request(server)
    .get('/api/products')
    .end((err, res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.an('array');
      done();
    });
  });
});



describe('/POST User login', () => {
  it('should authenticate user', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ 'username': 'yellowleopard753', 'password': 'jonjon' })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('string');
        done();
      })
  })
});

describe('/GET User cart', () => {
  it('should return users cart', (done) => {
    chai.request(server)
      .get('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        done();
      })
  })
});

describe('/POST Add to cart', () => {
  it('should add items to user cart', (done) => {
    chai.request(server)
      .post('/api/me/cart/add/1')
      .send({
        'id': '1',
        'categoryId': '1',
        'name': 'Superglasses',
        'description': 'The best glasses in the world',
        'price': 150,
        'imageUrls':['https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg', 'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg', 'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg']})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        done();
      })
  })
});

describe('/POST Change item quantity', () => {
  it('should update items in the users cart', (done) => {
    chai.request(server)
      .post('/api/me/cart/update/1')
      .send({
        'id': '1',
        'quantity': '10'})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        done();
      })
  })
});

describe('/DELETE Delete items from your cart', () => {
  it('should delete items from the users cart', (done) => {
    chai.request(server)
      .post('/api/me/cart/delete/1')
      .send({
        'id': '1',
        'quantity': '10'})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        done();
      })
  })
});