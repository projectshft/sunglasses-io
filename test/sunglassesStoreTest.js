let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it('it should return a list of all brands', (done) => {
      chai
        .request(server)
        .get('/v1/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  });

  describe("/Get products by brand id", () => {
    it('it should return a list of products by brand id', (done) => {
      let brandId = "2"
      chai 
        .request(server)
        .get(`/v1/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('brandId');
          res.body[0]['brandId'].should.be.eql('2');
          done();
        })
    })
  });
});

describe('Products', () => {
  describe('/GET products', () => {
    it('it should return a list of all products', (done) => {
      chai
        .request(server)
        .get('/v1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
});

describe('User', () => {
  describe('/POST login', () => {
    it('it should login in user and return user information', (done) => {
      chai 
        .request(server)
        .post('/login')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('gender');
          res.body.should.have.property('cart');
          res.body.should.have.property('name');
          res.body.should.have.proptery('location');
          res.body.should.have.property('email');
          res.body.should.have.property('dob');
          res.body.should.have.property('registered');
          res.body.should.have.property('phone');
          res.body.should.have.property('cell');
          res.body.should.have.property('picture');
          res.body.should.have.property('nat');
        })
    })
  });

  describe('/GET Access cart', () => {
    it("it should return the contents of the user's cart", (done) => {
      chai 
        .request(server)
        .get('/me/cart')
        .end((err, res), (done) => {
          res.should.have.status(200);
          res.should.be.an('array');
          res.body.length.should.eql(0);
        })
    })
  });

  describe('/POST Add product to cart', () => {
    it('it should add a specific product to cart', (done) => {
      chai
        .request(server)
        .post('/me/cart')
        .end((err, res), (done) => {
          res.should.have.status(200);
          res.should.be.an('array');
          res.body.length.should.eql(1);
        })
    })
  });

  describe('/DELETE product from cart', () => {
    it('it should delete a specified product from the cart', (done) => {
      let cart = {
        id: 1,
        brandId: 1,
        name: "Superglasses",
        description: "The best glasses in the world",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ],
        quantity: 1
      };

      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          chai
            .request(server)
            .delete('/me/cart/:productId')
            .end((err, res), () => {
              res.should.have.status(200);
              done();
            })
        })
    })
  })

  describe('/POST Update quantity of an item in cart', () => {
    it('it should update the quantity of a specific item in the cart', (done) => {
      chai
        .request(server)
        .post('/me/cart/:productId/:updQuantity')
        .end((err, res) => {
          res.should.have.status(200);
        })
    })
  })
});