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
    .get('/v1/brands')
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
    .get('/v1/brands?query=DKNY')
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
    .get('/v1/brands?query=')
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
    .get('/v1/brands?query=sdtfghjbknm')
    .end((err, res) => {
      expect(err).to.not.be.null;
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
    .get('/v1/products')
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
      .get("/v1/products?query=thickest")
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
    .get('/v1/products?query=cfgvhjbkjb')
    .end((err, res) => {
      expect(err).to.not.be.null;
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
      .get('/v1/brands/1/products')
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
      .get('/v1/brands/4356789/products')
      .end((err, res) => {
        expect(res).to.have.status(404);
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
  it.only('Should get the object representing the current user', done => {
    chai
    .request(server)
    .get('/v1/me')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an("object");
      done();
    })
  })
})
//GET ME/Cart test
describe('/GET /me/cart', () => {
  it.only(`should GET the currently logged-in user's cart`, done => {
    chai
    .request(server)
    .get('/v1/me/cart')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect('Content-Type', 'application/json');
      expect(res.body).to.be.an("array");
      done();
    })
  })
  // it("should fail if trying to access another user's cart", done => {
  //   chai
  //   .request(server)
  //   .get('/v1/otherUser/cart')
  //   .end((err, res) => {
  //     expect(err).to.not.be.null;
  //     expect(res).to.have.status(404);
  //     done();
  //   })
  // })
})

//GET brands/:id/products test
// describe('/GET products', () => {
//   it.only('should GET all products from a specific brand', done => {

//   })
// })

// //POST api/login test
// describe('/POST login', () => {
//   it.only('should allow a user to login', done => {

//   })
// })
//POST /me/cart test
describe('/POST cart', () => {
  it.only("should POST an item to the cart", done => {
    let item = {
      id: "8",
      categoryId: "4",
      name: "Coke cans",
      description: "The thickest glasses in the world",
      price: 110,
      imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    }
    chai
    .request(server)
    .post('/v1/me/item/cart')
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
// //DELETE api/me/cart/:productId test
// describe('/DELETE product from cart', () => {
//   it.only("should DELETE an existing item from the user's cart", done => {

//   })
// })
// //POST api/me/cart/:productId test
// describe('POST product to cart', () => { 
//   it.only("should update the product amount in the cart", done => {

//   })
// })