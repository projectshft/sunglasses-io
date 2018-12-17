const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;


chai.use(chaiHTTP);
chai.use(require('chai-sorted'));

//GET /brands test
describe('/GET brands', () => {
  it.only('should GET all brands', done => {
    chai
    .request(server)
    .get('/api/brands')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(5);
      done();
    })
  })
  it.only('should return a single brand corresponding with the query', done => {
    chai
    .request(server)
    .get('/api/brands?query=DKNY')
    .end((err, res) => {
      assert.isNotNull(res.body)
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1)
      done();
    })
  })
  it.only('returns all brands if query is missing', done => {
    chai
    .request(server)
    .get('/api/brands?query=')
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(5);
      done();
    })
  })
  it.only('fails when query is an unrecognized property', done => {
    chai
    .request(server)
    .get('/api/brands?query=sdtfghjbknm')
    .end((err, res) => {
      expect(res).to.have.status(404);
      done();
    })
  })
})

//GET Products test
describe('/GET products', () => {
  it.only('should GET all products', done => {
    chai
    .request(server)
    .get('/api/products')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(11);
      done();
    })
  })
  it.only("should limit results to those with a query string based on the product's description", done => {
    //for this test, I made the assumption that the user would search for
    //glasses that fit a description of the glasses they wanted (i.e. if
    //I wanted to find a specific style while not knowing the actual model of the 
    //product).
    chai
      .request(server)
      .get("/api/products?query=thickest")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
    });
  it.only('should fail when query does not yield a product', done => {
    chai
    .request(server)
    .get('/api/products?query=cfgvhjbkjb')
    .end((err, res) => {
      expect(res).to.have.status(404);
      done();
    })
  })
})

//GET Products within Brand Test
describe('/GET /brands/:id/products', () => {
  it.only('Should get the products of a given brand', done => {
    chai
    .request(server)
    .get('/api/brands/1/products')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(3);
      done();
    })
  })
  it.only('Should fail when brand is invalid', done => {
    chai
    .request(server)
    .get('/api/brands/4356789/products')
    .end((err, res) => {
      expect(res).to.have.status(404);
      done();
    })
  })
})


//Login tests
describe('/POST /api/login', () => {
  it.only('Should log in the user if the user exists', done => {
    let userCredentials = {
      "username" : "yellowleopard753",
      "password": "jonjon"
    }
    chai
    .request(server)
    .post('/api/login')
    .send(userCredentials)
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.be.a('string');
      expect(res.body).to.have.lengthOf(16)
      done();
    })
  })
  it.only(`Should alert the user if the login credential's formatting is incorrect`, done => {
    let userCredentials = {};
    chai
    .request(server)
    .post('/api/login')
    .send(userCredentials)
    .end((err, res) => {
      expect(res).to.have.status(400);
      done();
    })
  })
  it.only('Should alert the user if their username or password is incorrect', done => {
    let userCredentials = {
      "username" : "hello",
      "password": "world"
    }
    chai
    .request(server)
    .post('/api/login')
    .send(userCredentials)
    .end((err, res) => {
      expect(res).to.have.status(401);
      done();
    })
  })
})
//GET /ME Test
//this test doesn't seem to be explicitly necessary per the instructions, but
//makes sense to me to include it for verifying the user's identity and information
//in a real life situation (i.e. in an expanded version of the application, allowing to 
//check if the user has outdated information to then eventually update)
describe('/GET /me', () => {
  it.only(`Should provide the current user's information`, done => {
    chai
    .request(server)
    .get('/api/me')
    .send(user)
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an("object");
      done();
    })
  })
  it.only('Should deny permission to view user information if not logged in', done => {
    chai
    .request(server)
    .get('/api/me')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(401);
      done();
    })
  })
})
//GET ME/Cart test
describe('/GET /me/cart', () => {
  it.only(`should GET the currently logged-in user's cart`, done => {
    chai
    .request(server)
    .get('/api/me/cart')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an("array");
      done();
    })
  })
  it.only('Should deny permission to view cart if not logged-in', done => {
    chai
    .request(server)
    .get('/api/me')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(401);
      done();
    })
  })
})

//POST /me/cart test
describe('/POST cart', () => {
  it.only("should POST an item to the cart", done => {
    let itemToAdd = {
      "id": "8",
      "categoryId": "4",
      "name": "Coke cans",
      "description": "The thickest glasses in the world",
      "price": 110,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    }
    chai
    .request(server)
    .post('/api/me/cart')
    .send(itemToAdd)
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('categoryId');
      expect(res.body).to.have.property('name');
      expect(res.body).to.have.property('description');
      expect(res.body).to.have.property('price');
      expect(res.body).to.have.property('imageUrls')
      done();
    })
  })
})
//DELETE api/me/cart/:productId test
describe('/DELETE product from cart', () => {
  it.only('Should alert the user if not logged in', done => {
    chai
    .request(server)
    .delete('/api/me/cart/2')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(401);
      done();
    })
  })
  // it.only("should DELETE an existing item from the user's cart", done => {
  //   })
})
// //POST api/me/cart/:productId test
// describe('POST product to cart', () => { 
//   it.only("should update the product amount in the cart", done => {

//   })
// })