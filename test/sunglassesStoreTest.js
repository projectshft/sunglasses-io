let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it('should return a list of all brands', (done) => {
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
    it('should return a list of products by brand id', (done) => {
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
    it('should return a list of all products', (done) => {
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
    it('should login user and return user information', (done) => {
      chai 
        .request(server)
        .post('/v1/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.eql(1);
          done();
        })
    })
  });

  describe('/GET Access cart', () => {
    it("should return the contents of the user's cart", (done) => {
      chai 
        .request(server)
        .get('/v1/me/cart')
        .end((err, res), (done) => {
          res.should.have.status(200);
          res.should.be.an('array');
          res.body.length.should.eql(0);
        })
    })
  });

  describe('/POST Add product to cart', () => {
    it('should add a specific product to cart', (done) => {
      chai
        .request(server)
        .post('/v1/me/cart/:productId')
        .end((err, res), (done) => {
          res.should.have.status(200);
          res.should.be.an('array');
          res.body.length.should.eql(1);
          done();
        })
    })
  });

  describe('/DELETE product from cart', () => {
    it('should delete a specified product from the cart', (done) => {
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
    it('should update the quantity of a specific item in the cart', (done) => {
      chai
        .request(server)
        .post('/me/cart/:productId/:updQuantity')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        })
    })
  })
});