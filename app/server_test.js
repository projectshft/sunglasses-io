let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');

let should = chai.should();
let cartUpdateTest = [
  {
    '1': {
      item: {
        productId: '1',
        brandId: '1',
        title: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150,
        imageUrls: [
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
        ]
      },
      quantity: 3
    }
  }
];

chai.use(chaiHttp);

//desribe the products
describe('Products', () => {
  //describe the get call of the products
  describe('GET products', () => {
    //it for what GET products should do
    it('should return all products', done => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return product based on query', done => {
      chai
        .request(server)
        .get('/products?query=Black')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.eql(1); //another way to check length
          done();
        });
    });
    it('should return all products if query param is empty', done => {
      chai
        .request(server)
        .get('/products?query=')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(11);
          done();
        });
    });
    it('should return 404 if no product matches the query', done => {
      chai
        .request(server)
        .get('/products?query=ponies')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});

//describe the brands
describe('Brands', () => {
  //describe the Brands GET
  describe('GET brands', () => {
    //it for what Get brands should do
    it('should return all brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(5);
          done();
        });
    });
    //describe GET products by brand ID
    describe('by brandId/products', () => {
      //it for what the describe should do
      it('should return all products matching brand ID', done => {
        chai
          .request(server)
          .get('/brands/2/products')
          .end((error, response) => {
            response.should.have.status(200);
            response.body.should.be.an('array');
            response.body.should.have.length(2);
            done();
          });
      });
      it('should return 404 if the brand ID does not exist', done => {
        chai
          .request(server)
          .get('/brands/7/products')
          .end((error, response) => {
            response.should.have.status(404);
            done();
          });
      });
    });
  });
});

//describe the login
describe('Login POST', () => {
  //describe with a valid username/pw
  describe('with a valid username and password', () => {
    //should create a new acces token if none exist
    it('should create a new access token if none exist', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200);
          accessToken = response.body;
          done();
        });
    });
    //should use an old access token if one exists
    it('should use an old access token if one exists', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200);
          done();
        });
    });
  });
  //it for what should happen if username is left blank
  it('should return 400 if username is left blank', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: '', password: 'jonjon' })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });
  //it for what should happen if password is left blank
  it('should return 400 if password is left blank', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: '' })
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
  });
  //it for what should happen if the username is wrong
  it('should return 401 if username is wrong', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'ye', password: 'jonjon' })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
  //it for what should happen if the password is wrong
  it('should return 401 if password is wrong', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'w' })
      .end((error, response) => {
        response.should.have.status(401);
        done();
      });
  });
});

//describe the /me/cart
describe('/me/cart', () => {
  //describe the car GEt
  describe('GET cart', () => {
    //what should happen
    it('should return the cart of the current user', done => {
      chai
        .request(server)
        .get('/me/cart')
        .set('xauth', 'qswWsnJLHJlcIHoY')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          done();
        });
    });
    //what should happn if there's no access token
    it('should return an error if there is no access token', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
    //what should happen if there is an incorrect access token
    it('should return a 400 error if the access token is invalid', done => {
      chai
        .request(server)
        .get('/me/cart')
        .set('xauth', 'abcdefghijklmnop')
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });
  });
  //describe the /me/cart PUSH
  describe('PUSH cart', () => {
    //should check that user is logged in
    it('should return error if user is not logged in', done => {
      chai
        .request(server)
        .post('/me/cart')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
    //should update the quantity of the product
    it('should update the quantity based on productId and quantity parameters', done => {
      chai
        .request(server)
        .post('/me/cart?productId=1&quantity=2')
        .set('xauth', 'qswWsnJLHJlcIHoY')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.be.eql(cartUpdateTest);
          done();
        });
    });
    //should return an error if this item is not currently in the cart
    it('should return 405 error if the item is not currenlty in the cart', done => {
      chai
        .request(server)
        .post('/me/cart?productId=7&quantity=2')
        .set('xauth', 'qswWsnJLHJlcIHoY')
        .end((error, response) => {
          response.should.have.status(405);
          done();
        });
    });
  });
});
//describe the /me/cart/{productId}
describe('/me/cart/:productId', () => {
  //describe the GET
  describe('GET', () => {
    //should add the item to the cart if it wasn't there
    it("should add the item to the user's cart if it was not already there", done => {
      chai
        .request(server)
        .post('/me/cart/2')
        .set('xauth', 'qswWsnJLHJlcIHoY')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.length(2);
          done();
        });
    });
    //should increase the quantity
    it('should increase the quantity in the cart by 1 if the product is already there', done => {
      chai
        .request(server)
        .post('/me/cart/1')
        .set('xauth', 'qswWsnJLHJlcIHoY')
        .end((error, response) => {
          response.should.have.status(200);
          done();
        });
    });
  });
});
