let chai = require('chai');
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {

  describe("GET /api/brands", () => {
    it("it should return all brands of sunglasses", (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.should.be.json;
          res.body.should.have.lengthOf(5);
          // Check for expected brands in the response
          let expectedBrands = ["Oakley", 'Ray Ban', "Levi's", "DKNY", "Burberry", "Viper"];
          expectedBrands.forEach(brand => {
            res.body.some(b => b.name === brand).should.be.true
          })
          done();
        });
    });

    it('should return a 400 error for an invalid search', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 404 error if endpoint cant be found', (done) => {
      chai
        .request(server)
        .get('/api/brandss')
        .end((err, res) => {
          res.should.have.status(404);
          done()
        });
    });
  });

  describe("GET /api/brands/{Id}/products", () => {

    it('should return products by brand Id', (done) => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          console.log(res.status)
          console.log(res.body)
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.should.be.json;
          done();
        });
    });

    it('should return a 400 error for an invalid brand ID format', (done) => {
      chai
        .request(server)
        .get('/api/brands/InvalidID/products')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 404 if brand ID does not exist', (done) => {
      chai
        .request(server)
        .get('/api/brands/7/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("Products", () => {

  describe("GET /api/products", () => {

    it('should return and array of the correct products for any given brand ID', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.should.be.json;
          res.body.forEach(product => {
            product.should.have.property('categoryId', '12')
          })
          done();
        });
    });

    it('should return a 404 response if inventory is not found', (done) => {
      chai
        .request(server)
        .get(`/api/products?q=${search}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
})

describe('Login', () => {

  describe('POST /api/login', () => {

    it('should successfully log user in with valid credentials', (done) => {
      let credentials = {
        username: "greenlion235",
        password: "waters"
      }

      chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('accessToken')
          done();
        });
    });

    it('should handle incorrect username or password with 400 response', (done) => {
      let credentials = {
        username: 'jimbobjoe16',
        password: 'helloworld'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(400)
          done();
        });
    });
  });
});

describe('Cart', () => {

  describe('GET /api/me/cart', () => {

    accessToken = 'exAccessToken';
    const cartItem = { item: 'exampleItem', quantity: 2 }

    it('should return an array of the users items in their cart', (done) => {

      chai
        .request(server)
        .get('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done();
        });
    });

    it('should return an empty array before a user has added a product', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done();
        });
    });

    it('should return a subtotal for items in cart', (done) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(200)
          done();
        });

      chai
        .request(server)
        .get('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('subtotal')
          done();
        });
    });

    it('should return a 401 error if user is not authenticated', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401)
          done();
        });
    });
  });

  describe('POST /api/me/cart', () => {

    const invalidCartItem = { item: 'banana peppers', quantity: 1 };
    const cartItem = { itemId: '12', quantity: 1 }
    it('should not allow user to add invalid items to cart', (done) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(invalidCartItem)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done();
        });
    });

    it('should update the users shopping cart with item they selected', (done) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should allow multiple items to be added to the cart in one instance', (done) => {
      const cartItems = [
        { itemId: '12', quantity: 2 },
        { itemId: '21', quantity: 1 }
      ];

      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(cartItems)
        .end((err, res) => {
          res.should.have.status(200);
          cartItems.forEach(item => {
            res.body.should.deep.include(item)
          });
        });
    });

    it('should correctly update the quantities of products in users cart upon modification', (done) => {
      const initCartItem = { itemId: '12', quantity: 1 }

      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(initCartItem)
        .end((err, res) => {
          res.should.have.status(200)
          done();
        });
      const modifiedCartItem = { itemId: '12', quantity: 3 }

      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(modifiedCartItem)
        .end((err, modifyRes) => {
          modifyRes.should.have.status(200)
          done();
        });

      chai
        .request(server)
        .get('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .end((err, getRes) => {
          getRes.should.have.status(200)
          done();
        });
    });
  });

  it('should return a 400 error for a bad request', (done) => {
    chai
      .request(server)
      .post('/api/me/cart')
      .set('Authentication', `Bearer ${accessToken}`)
      .end((err, res) => {
        res.should.have.status(400)
        done();
      });
  });

  it('should return a 401 if user is not authenticated', (done) => {
    chai
      .request(server)
      .post('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(401)
        done();
      });
  });

  describe('Delete api/me/cart/{productId}', () => {

    it('should successfully remove a product from the users cart', (done) => {
      const cartItem = { itemId: '12', quantity: 1 };

      chai
        .request(server)
        .post('/api/me/cart')
        .set('Authentication', `Bearer ${accessToken}`)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(200);
        });

      chai
        .request(server)
        .delete(`/api/me/cart/${cartItem.itemId}`)
        .set('Authentication', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(204)
          done();
        });
    });
  });
});




