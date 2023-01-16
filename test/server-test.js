const chai = require('chai');
const chaiHttp = require('chai-http');
let { expect } = require('chai');
let server = require('../app/server');

let products = require("../initial-data/products.json");

const should = chai.should();
chai.use(chaiHttp);

const accessToken = "9DdyGguPUCVfw9hH";


//test 1 return all brands
describe('api/brands', () => {
  describe('GET', () => {
    it('it should return an array of brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(5);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');
          done();
        });
    });
  })
})


//test 2 return all products
describe('api/products', () => {
  describe('GET', () => {
    it('it should return all products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(11);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('price');
          res.body[0].should.have.property('categoryId');
          done();
        });
    });
  })
})

let id = '2';
//test 3 brand id products
describe(`/api/brands/:${id}/products`, () => {
  it(`return an array of products with the category id of ${id}`, (done) => {
    chai
      .request(server)
      .get(`/api/brands/${id}/products`)
      .end((err, res) => {
        res.should.have.status('200');
        res.body.should.be.an('array');
        res.body.forEach((product) => {
          product.should.have.property('categoryId').that.equals(id);
          product.should.have.property('name');
          product.should.have.property('price');
          product.should.have.property('imageUrls');
        });
        done();
        });
    })
  })


// //test 4 POST /api/login
  
describe('/api/login', () => {
  describe('POST', () => {
    it('returns an access token if login is valid', (done) => {
      console.log('test');
      chai
        .request(server)
        .post('/api/login')
        .send({ username: 'lazywolf342', password: 'tucker' })
        .end((err, res) => {
          res.should.have.status('200');
          done();
        });
    });
  })
    it('should not return access token if doesnt match user', (done) => {
      chai
      .request(server)
      .post('/api/login')
      .send({ username: 'lazyguy342', password: 'rucker' })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
    it("it should not return access token if user or password missing", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({ username: 'lazyguy342' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
  });
});


  //test 5
  describe('/api/me/cart', () => {
  describe("GET", () => {
    it("shows the user's cart", (done) => {
      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("wont show user cart if no access token", (done) => {
      chai
        .request(server)
        .get(`/api/me/cart?`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });


  // test 6
  describe("POST add item to user cart", () => {
    it("adds an item to user's cart", (done) => {
      let product = products[0];
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.be.an("object");
          done();
        });
    });
    it("wont show user cart if wrong access token", (done) => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=123`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});


// test 7    
describe("DELETE remove item from cart", () => {
    it("delete selected item from cart", (done) => {
      let id = "4";
      chai
        .request(server)
        .delete(`/api/me/cart/${id}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("wont show user cart if wrong access token", (done) => {
      let id = "4";
      chai
        .request(server)
        .delete(`/api/me/cart/${id}?accessToken=123`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("POST change cart quantity", () => {
    it("changes the quantity of item in cart", (done) => {
      let id = "4";
      chai
        .request(server)
        .post(`/api/me/cart/${id}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.be.an("object");
          done();
        });
    });
    it("wont show user cart if wrong access token", (done) => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=123`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });