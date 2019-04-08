const chai = require('chai');
const chaiHttp = require('chai-http');
const { server } = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('BRANDS', () => {
  describe('GET /api/brands', () => {
    it('should return an array of all the brands', done => {
      // arrange
      // act
      chai
        .request(server)
        .get('/api/brands')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(5);
          done();
        });
    });
    it('should return the number of brands in the query', done => {
      // arrange: "limit=4"
      // act
      chai
        .request(server)
        .get('/api/brands?limit=4')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(4);
          done();
        });
    });
    it('should return an error if the query is incorrectly formatted', done => {
      // arrange: "limit=boogers"
      // act
      chai
        .request(server)
        .get('/api/brands?limit=boogers')
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
  });
  describe('GET /api/brands/:brandId/products', () => {
    it('should return an array of products with the given brandId', done => {
      // arrange: "brandId = 1"
      // act
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(3);
          done();
        });
    });
    it('should return an error if no products are found with that brandId', done => {
      // arrange: brandId = bob
      // act
      chai
        .request(server)
        .get('/api/brands/bob/products')
        .end((error, response) => {
          // assert
          response.status.should.equal(404);
          done();
        });
    });
  });
});

describe('PRODUCTS', () => {
  describe('GET /api/products', () => {
    it('should return all products when there is no search criteria', done => {
      // arrange
      // act
      chai
        .request(server)
        .get('/api/products')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return all products matching the given search term (brand)', () => {
      // arrange: search=Oakley (brand case)
      // act
      chai
        .request(server)
        .get('/api/products?search=Oakley')
        .then(response => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(3);
        })
        .catch(error => console.log(error));
    });
    it('should return all products matching the given search term (name)', done => {
      // arrange: search=qdogs
      // act
      chai
        .request(server)
        .get('/api/products?search=qdogs')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(1);
          done();
        });
    });
    it('should return all products matching the given search term (description)', done => {
      // arrange: search=best
      // act
      chai
        .request(server)
        .get('/api/products?search=best')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(4);
          done();
        });
    });
  });
});

describe('LOGIN', () => {
  describe('POST /api/login', () => {
    it('should allow the user to login with an email and password and return an access token', done => {
      // arrange
      const user = {
        email: 'susanna.richards@example.com',
        password: 'jonjon'
      };
      // act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.have.property('token');
          done();
        });
    });
    it('should display an error if the email is missing', done => {
      // arrange
      const user = {
        email: '',
        password: 'jonjon'
      };
      // act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
    it('should display an error if the password is missing', done => {
      // arrange
      const user = {
        email: 'susanna.richards@example.com',
        password: ''
      };
      // act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
    it('should display an error if the email is invalid', done => {
      // arrange
      const user = {
        email: 'jonjon.richards@example.com',
        password: 'jonjon'
      };
      // act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should display an error if the password is invalid', done => {
      // arrange
      const user = {
        email: 'susanna.richards@example.com',
        password: 'bonbon'
      };
      // act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
  });
});

describe('CART ', () => {
  describe('GET /api/me/cart', () => {
    it('should check for a valid access token and return the cart array', done => {
      // arrange: hardcoded an access token in helper.js
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', '12345')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(1);
          response.body.should.be.deep.equal([
            {
              quantity: 2,
              product: {
                id: '11',
                brandId: '5',
                name: 'Habanero',
                description: 'The spiciest glasses in the world',
                price: 153,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ]);
          done();
        });
    });
    it('should return an error if the user is invalid', done => {
      // arrange: hardcoded invalid user in helper.js
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'abcde')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should return an error if the access token is invalid', done => {
      // arrange: hardcoded invalid token
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'not a real token')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
  });
  describe('POST /api/me/cart/edit', () => {
    it('should take in a product ID and quantity parameter and return the updated shopping cart array', done => {
      // arrange: productId=5&quantity=30
      // act
      chai
        .request(server)
        .post('/api/me/cart/edit?productId=11&quantity=30')
        .set('x-access-token', '12345')
        .send()
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.be.deep.equal([
            {
              quantity: 30,
              product: {
                id: '11',
                brandId: '5',
                name: 'Habanero',
                description: 'The spiciest glasses in the world',
                price: 153,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ]);
          done();
        });
    });
    it('should return an error if the productId is missing', done => {
      // arrange: no productId in request
      // act
      chai
        .request(server)
        .post('/api/me/cart/edit?quantity=30')
        .set('x-access-token', '12345')
        .send()
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
    it('should return an error if the quantity is missing', done => {
      // arrange: no quantity in request
      // act
      chai
        .request(server)
        .post('/api/me/cart/edit?productId=11')
        .set('x-access-token', '12345')
        .send()
        .end((error, response) => {
          // assert
          response.status.should.equal(400);
          done();
        });
    });
    it('should return an error if the user is invalid', done => {
      // arrange: hardcoded invalid user in helper.js
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'abcde')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should return an error if the access token is invalid', done => {
      // arrange: hardcoded invalid token
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'not a real token')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should return an error if the product is not in the cart', done => {
      // arrange: pass invalid product into cart
      // act
      chai
        .request(server)
        .post('/api/me/cart/edit?productId=99&quantity=99')
        .set('x-access-token', '12345')
        .send()
        .end((error, response) => {
          // assert
          response.status.should.equal(404);
          done();
        });
    });
  });
  describe('POST /api/me/cart/:productId/add', () => {
    it('should take in a product ID and return the cart array with the new product added', done => {
      // arrange
      // act
      chai
        .request(server)
        .post('/api/me/cart/11/add')
        .set('x-access-token', '11111')
        .send()
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.be.deep.equal([
            {
              quantity: 1,
              product: {
                id: '11',
                brandId: '5',
                name: 'Habanero',
                description: 'The spiciest glasses in the world',
                price: 153,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ]);
          done();
        });
    });
    it('should return an error if the product does not exist', done => {
      // arrange: pass productId=99 into path
      // act
      chai
        .request(server)
        .post('/api/me/cart/99/add')
        .set('x-access-token', '11111')
        .end((error, response) => {
          // assert
          response.status.should.equal(404);
          done();
        });
    });
    it('should return an error if the user is invalid', done => {
      // arrange: hardcoded invalid user in helper.js
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'abcde')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should return an error if the access token is invalid', done => {
      // arrange: hardcoded invalid token
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'not a real token')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
  });
  describe('DELETE /api/me/cart/:productId/delete', () => {
    it('should take a productId and delete the selected item from the cart', done => {
      // arrange: hardcode productId
      // act
      chai
        .request(server)
        .delete('/api/me/cart/8/delete')
        .set('x-access-token', '00000')
        .end((error, response) => {
          // assert
          response.status.should.equal(200);
          response.body.should.be.an('array');
          response.body.should.have.length(1);
          response.body.should.be.deep.equal([
            {
              quantity: 2,
              product: {
                id: '7',
                brandId: '3',
                name: 'QDogs Glasses',
                description: 'They bark',
                price: 1500,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ]);
          done();
        });
    });
    it('should return an error if the product does not exist', done => {
      // arrange: pass productId=99 into path
      // act
      chai
        .request(server)
        .post('/api/me/cart/99/delete')
        .set('x-access-token', '11111')
        .end((error, response) => {
          // assert
          response.status.should.equal(404);
          done();
        });
    });
    it('should return an error if the user is invalid', done => {
      // arrange: hardcoded invalid user in helper.js
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'abcde')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
    it('should return an error if the access token is invalid', done => {
      // arrange: hardcoded invalid token
      // act
      chai
        .request(server)
        .get('/api/me/cart')
        .set('x-access-token', 'not a real token')
        .end((error, response) => {
          // assert
          response.status.should.equal(401);
          done();
        });
    });
  });
});
