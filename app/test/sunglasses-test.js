let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);

describe('Brands', () => {

  //basic initial GET for Brands
  describe('/GET brands', () =>{
    it('it should GET all the brands', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    });
  });

  //tests for brands/:id/products
  describe('/GET brands/{id}/products', () => {
    //grab the initial value to make the test pass
    it('it should GET all the products for brand Id given', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        })
    });
    //test to check that brand Id actually exists with our initial data
    it('it should return an error if the brand Id does not exist', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands/8/products')
        .end((err, res) => {
          //assert
          res.should.have.status(404);
          done();
        })
    });
    //test to check that brand Id is an appropriate character type
    it('it should return an error if the brand Id is an incorrect character type', done => {
      //arrange
      chai
        .request(server)
        .get('/api/brands/{8}/products')
        .end((err, res) => {
          //assert
          res.should.have.status(404);
          done();
        })
    });
  });

});

describe('Products', () => {
  describe('/GET products', () => {
    it('it should GET all the products', done => {
      //arrange
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    });
  });
});

//Let's test some User functionality!
describe('User', () => {

  //check for vanilla known login
  describe('/POST Login time', () => {
    it('it should POST for a User to login', done => {
      //arrange
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'salvador.jordan@example.com',
          password: 'tucker'
        })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        })
    });
  });

  //check for both email and password
  //check for login using bad credentials
  describe('/POST Login time, with incorrect credentials', () => {
    it('it should POST for a User to login, but return invalid error', done => {
      //arrange
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'salvador.jordan@example.com',
          password: ''
        })
        .end((err, res) => {
          //assert
          res.should.have.status(401);
          done();
        })
    });
  });
  //check for login missing credentials
  describe('/POST Login time, with blank email', () => {
    it('it should POST for a User to login, but return invalid error', done => {
      //arrange
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: '',
          password: 'tucker'
        })
        .end((err, res) => {
          //assert
          res.should.have.status(401);
          done();
        })
    });
  });

  //should return a 400 error if we're missing parameters
  describe('/POST Login time, with missing parameter', () => {
    it('it should POST for a User to login, but return invalid error', done => {
      //arrange
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'salvador.jordan@example.com',
        })
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

  //login function should return a token
  describe('/POST Login time', () => {
    it('it should POST for a User to login, and return a token', done => {
      //arrange
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'salvador.jordan@example.com',
          password: 'tucker'
        })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.token.should.be.a('string');
          done();
        })
    });
  });
  
  //GET cart for logged-in User
  describe('/GET User cart', () => {
    it('it should GET User Cart, if login token is present', done => {
      //arrange
      chai
        .request(server)
        .get('/api/me/cart')
        .query({ token: 'thisismytokenyup' })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    });
  });

  //our cart GET should check for the token query param, and return an error
  describe('/GET User cart, with missing token parameter', () => {
    it('it should respond with 400 error, if token parameter is not present', done => {
      //arrange
      chai
        .request(server)
        .get('/api/me/cart')
        .query({ hi: 'hello' })
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

  //our cart GET should return an error if the token user is not found
  describe('/GET User cart, with incorrect token parameter', () => {
    it('it should respond with 401 error, if token parameter is incorrect', done => {
      //arrange
      chai
        .request(server)
        .get('/api/me/cart')
        .query({ token: 'totallynotrighttoken' })
        .end((err, res) => {
          //assert
          res.should.have.status(401);
          done();
        })
    });
  });

});

//Let's test some User POST to Cart functionality!
describe('User POST to Cart', () => {

  //our cart POST should return the item added to the cart as confirmation
  describe('/POST User cart', () => {
    it('it should respond with 200 and item added to cart, if post is successful', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart')
        .query({ token: 'thisismytokenyup' })
        .send({
          id: "2",
          categoryId: "1",
          name: "Black Sunglasses",
          description: "The best glasses in the world",
          price: 100,
          imageUrls: ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          done();
        })
    });
  });

  //our POST cart should return 400 if there is a missing token query parameter
  describe('/POST User cart', () => {
    it('it should respond with 400 if missing token query', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart')
        .send({
          id: "2",
          categoryId: "1",
          name: "Black Sunglasses",
          description: "The best glasses in the world",
          price: 100,
          imageUrls: ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

  //our POST cart should return 401 if there is an incorrect token parameter
  describe('/POST User cart', () => {
    it('it should respond with 401 if incorrect token within query', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart')
        .query({ token: 'somerandomtoken' })
        .send({
          id: "2",
          categoryId: "1",
          name: "Black Sunglasses",
          description: "The best glasses in the world",
          price: 100,
          imageUrls: ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          //assert
          res.should.have.status(401);
          done();
        })
    });
  });

  //our POST cart should return 400 if there is no object being passed in the body
  describe('/POST User cart', () => {
    it('it should respond with 400 if no object with id within POST body', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart')
        .query({ token: 'thisismytokenyup' })
        .send([])
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

  //our POST cart should return 404 if there is no product of the type passed in
  describe('/POST User cart', () => {
    it('it should respond with 404 if there is no product type from POST body id', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart')
        .query({ token: 'thisismytokenyup' })
        .send({
          id: "19",
        })
        .end((err, res) => {
          //assert
          res.should.have.status(404);
          done();
        })
    });
  });

  //let's have fun with /me/cart/{productId}
  //product should add to cart and respond with cart information for product
  describe('/POST User cart with productId', () => {
    it('it should respond with 200 and item added to cart, if post is successful', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/5')
        .query({ token: 'thisismytokenyup' })
        .send({})
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        })
      });
  });

  //our POST cart should return 400 if there is a missing token query parameter
  describe('/POST User cart with productId, missing token', () => {
    it('it should respond with 400', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/5')
        .send({})
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

  //our POST cart should return 401 if there is an incorrect token parameter
  describe('/POST User cart with productId, incorrect token', () => {
    it('it should respond with 401 if incorrect token within query', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/8')
        .query({ token: 'somerandomtoken' })
        .send({
          id: "2",
          categoryId: "1",
          name: "Black Sunglasses",
          description: "The best glasses in the world",
          price: 100,
          imageUrls: ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        })
        .end((err, res) => {
          //assert
          res.should.have.status(401);
          done();
        })
    });
  });

  //our POST cart should return 400 if there is no product of the type passed in
  describe('/POST User cart with productId, wrong :productId dataType', () => {
    it('it should respond with 400 if productId is incorrect data type', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/y')
        .query({ token: 'thisismytokenyup' })
        .send({})
        .end((err, res) => {
          //assert
          res.should.have.status(400);
          done();
        })
    });
  });

});


//Let's test some User POST/DELETE to Cart functionality, but with quantities!
describe('User POST to Cart, with quantity checks', () => {
  //our cart POST should return the item and quantity within the cart as confirmation
  describe('/POST User cart', () => {
    it('it should respond with 200 and item added to cart, if post is successful', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/8')
        .query({ token: 'thisismytokenyup' })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('product');
          res.body.should.have.property('quantity');
          done();
        })
    });
  });

  //our cart POST should return the item and quantity within the cart as confirmation,
  //and update by the amount given in the optional 'total' parameter
  describe('/POST User cart', () => {
    it('it should respond with 200 and item added to cart, if post is successful', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/11')
        .query({ token: 'thisismytokenyup', total: 5 })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('product');
          res.body.should.have.property('quantity');
          res.body.quantity.should.be.equal('5')
          done();
        })
    });
  });

});

describe('User DELETE to Cart, with quantity checks', () => {
  //our cart DELETE should return the item and quantity within the cart as confirmation
  beforeEach(function () {
    it('it should respond with 200 and item added to cart, if post is successful', done => {
      //arrange
      chai
        .request(server)
        .post('/api/me/cart/5')
        .query({ token: 'thisismytokenyup' })
        .send({})
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        })
    });
  })

  describe('/DELETE User cart', () => {
    it('it should respond with 200 and item changed in cart, if delete is successful', done => {
      //arrange
      chai
        .request(server)
        .delete('/api/me/cart/5')
        .query({ token: 'thisismytokenyup' })
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        })
    });
  });

  //our cart DELETE should return a 204 if the item doesn't exist in the cart
  describe('/DELETE User cart', () => {
    it('it should respond with 204 if there is no item within the cart to delete', done => {
      //arrange
      chai
        .request(server)
        .delete('/api/me/cart/4')
        .query({ token: 'thisismytokenyup' })
        .end((err, res) => {
          //assert
          res.should.have.status(204);
          done();
        })
    });
  });

});
