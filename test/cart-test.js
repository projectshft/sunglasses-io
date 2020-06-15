let UserCart = require('../app/modules/cart-module');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
chai.use(require('chai-things'));
let should = chai.should();

chai.use(chaiHttp);


describe('User Cart', () => {
  describe('/GET products in cart', () => {
    it('it should GET an empty array if there are no products in the user\'s cart', done => {
      let user = {
        username: "lazywolf342",
        password: "tucker"
      }
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          chai
            .request(server)
            .get('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(0);
              done();
            });
        });
    });

    it('it should GET an an array of products in the users cart, with the correct type of products', done => {
      let user = {
        username: "yellowleopard753",
        password: "jonjon"
      }
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          chai
            .request(server)
            .get('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.all.have.property('id');
              res.body.should.all.have.property('categoryId');
              res.body.should.all.have.property('name');
              res.body.should.all.have.property('name');
              res.body.should.all.have.property('price');
              res.body.should.all.have.property('imageUrls');
              done();
            });
        });
    });
  });


  describe('/POST products in cart', () => {
    it('it should POST (add a product) to the users cart', done => {
      //arrange a scenario
      let user = {
        username: "greenlion235",
        password: "waters"
      }

      let testProduct = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      //act
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          chai
            .request(server)
            .post('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .send(testProduct)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('id');
              res.body.should.have.property('categoryId');
              res.body.should.have.property('name');
              res.body.should.have.property('name');
              res.body.should.have.property('price');
              res.body.should.have.property('imageUrls');
              done();
            })
        });
    });

    it('it should fail if a product is sent without an id ', done => {
      // arrange
      let user = {
        username: "lazywolf342",
        password: "tucker"
      }

      let testProduct = {
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      //act
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          chai
            .request(server)
            .post('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .send(testProduct)
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        });
    });
  });


  describe('/DELETE product from cart', () => {
    it('it should DELETE a product in the cart (using its product id)', done => {
      // arrange: create a test product to add to the user's cart, so that we can then test deleting it
      let user = {
        username: "yellowleopard753",
        password: "jonjon"
      }
      let testProduct = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          chai
            .request(server)
            .post('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .send(testProduct)
            .end((err, res) => {
              // const addedProduct = res.body
              // act
              chai
                .request(server)
                .delete('/api/me/cart/' + testProduct.id)
                .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
                .query({ accessToken: token })
                .end((err, res) => {

                  res.should.have.status(200);
                  res.body.should.be.an('object')
                  // check if product has been removed from the cart
                  chai
                    .request(server)
                    .get('/api/me/cart/' + testProduct.id)
                    .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
                    .query({ accessToken: token })
                    .end((err, res) => {
                      res.should.have.status(404);
                      done();
                    });
                });
            });
        });
    });
  });

  describe('/POST product from cart', () => {
    it('it should UPDATE the quantity product in the cart (using its product id)', done => {
      // arrange: create a test product to add to the cart, so that we can then modifying its quantity
      let user = {
        username: "yellowleopard753",
        password: "jonjon"
      }

      let testProduct = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price": 150,
        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      chai
        .request(server)
        .post('/api/login')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .send(user)
        .end((err, res) => {
          let token = res.body;
          //add test product to cart
          chai
            .request(server)
            .post('/api/me/cart')
            .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
            .query({ accessToken: token })
            .send(testProduct)
            .end((err, res) => {
              //change the quantity of the test product
              //testProduct.quantity = 5;
              let addedProduct = res.body;
              addedProduct.quantity = 5;
              //now send the request to change the quantity of the product
              chai
                .request(server)
                .post('/api/me/cart/' + addedProduct.id)
                .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
                .query({ accessToken: token })
                .end((err, res) => {
                  // assert
                  res.should.have.status(200);
                  //  const updatedProduct = res.body
                  // check if quantity of product has been updated correctly
                  chai
                    .request(server)
                    .get('/api/me/cart/' + addedProduct.id)
                    .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
                    .query({ accessToken: token })
                    .end((err, res) => {
                      res.should.have.status(200);
                      // res.body.should.have.property('quantity', 5);
                      done();
                    });
                });
            });
        });
    });
  });
});



