let UserCart = require('../app/models/cart-model');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

beforeEach(() => {
  UserCart.removeAllProductsFromCart();
});

describe('User Cart', () => {
  describe('/GET products in cart', () => {
    it('it should GET an empty array if there are no products in the cart', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/POST products in cart', () => {
    it('it should POST (add a product) to the users cart', done => {
      //arrange a scenario
      let testProduct = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      //act
      chai
        .request(server)
        .post('/api/me/cart')
        .send(testProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('categoryId');
          res.body.should.have.property('name');
          res.body.should.have.property('description');
          res.body.should.have.property('price');
          res.body.should.have.property('imageUrls');
          done();
        })
    });

    it('it should fail if a product is sent without an id ', done => {
      // arrange
      let testProduct1 = {
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      // act
      chai
        .request(server)
        .post('/api/me/cart')
        .send(testProduct1)
        .end((err, res) => {
          // assert
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/DELETE product from cart', () => {
    it('it should DELETE a product in the cart (using its product id)', done => {
      // arrange: create a test product to add to the cart, so that we can then test deleting it
      let testProduct2 = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      chai
        .request(server)
        .post('/api/me/cart')
        .send(testProduct2)
        .end((err, res) => {
          //the post request to add a product to the cart returns the product added in the response, so we can assign a variable to the product after it is added to check if its been deleted
          const addedProduct = res.body
          // act
          chai
            .request(server)
            .delete('/api/me/cart/' + addedProduct.id)
            .end((err, res) => {
              // assert
              res.should.have.status(200);

              // check if product has been removed from the cart
              chai
                .request(server)
                .get('/api/me/cart/' + addedProduct.id)
                .end((err, res) => {
                  res.should.have.status(404);
                  done();
                });
            });
        });
    });
  });

  describe('/POST product from cart', () => {
    it('it should UPDATE the quantity product in the cart (using its product id)', done => {
      // arrange: create a test product to add to the cart, so that we can then modifying its quantity
      let testProduct3 = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      chai
        .request(server)
        .post('/api/me/cart')
        .send(testProduct3)
        .end((err, res) => {
          //the post request to add a product to the cart returns the product added in the response, so we can assign a variable to the response product to then check if its been updated
          const addedProduct = res.body
          addedProduct.quantity = 5;
          // act
          chai
            .request(server)
            .post('/api/me/cart/' + addedProduct.id)
            .send(addedProduct)
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              const updatedProduct = res.body
              // check if quantity of product has been updated correctly
              chai
                .request(server)
                .get('/api/me/cart/' + updatedProduct.id)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('quantity', 5);
                  done();
                });
            });
        });
    });
  });
 });

