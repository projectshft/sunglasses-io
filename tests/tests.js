const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const should = chai.should();
const { expect } = require('chai');

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET Brands", () => {
    it('should return all the brands', (done) => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  });

  describe("/GET Products by brand", () => {
    it('should return products by brand id', (done) => {
      const brandId = "2"
      chai.request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('categoryId');
          res.body[0]['categoryId'].should.be.eql('2');
          done();
        })
    })
  });
});

describe("Products", () => {
  describe("/GET Products", () => {
    it('should return all the Products', (done) => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  });
});

describe("User", () => {
  describe("/POST User Login", () => {
    it('should authenticate user', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({ "username": "lazywolf342", "password": "tucker" })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        })
    })
  });

  describe("/GET User Cart", () => {
    it('should return users cart', (done) => {
      chai.request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });

  describe("/POST Add to Cart", () => {
    it('should add items to user cart', (done) => {
      chai.request(server)
        .post('/api/me/cart/add/11')
        .send({
          "id": "11",
          "categoryId": "5",
          "name": "Habanero",
          "description": "The spiciest glasses in the world",
          "price":153,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });

  describe("/POST Update Cart Quantity", () => {
    it('should update items in user cart', (done) => {
      chai.request(server)
        .post('/api/me/cart/update/11')
        .send({
          "id": "11",
          "quantity": "2"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });

  describe("/DELETE Delete items in cart", () => {
    it('should remove items from user cart', (done) => {
      chai.request(server)
        .post('/api/me/cart/delete/11')
        .send({
          "id": "11",
          "quantity": "2"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });
});
