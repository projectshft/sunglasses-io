let chai = require('chai');
let chaiHttp = require('chai-http')
let server = require('../app/server');
const { request } = require('http');

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
          res.body.should.have.lengthOf(5);
          done();
        });
    });

    it('should return a 404 error if endpoint cant be found', (done) => {
      chai
        .request(server)
        .get('/api/nonexistent')
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
        .get('/api/brands/3/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.should.be.json;
          res.body.length.should.be.eql(2)
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
        .get('/api/brands/12/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("Products", () => {

  describe("GET /api/products", () => {

    it('should return an array of all products if no search query', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.should.be.json;
          res.body.should.have.lengthOf(11);
          done();
        });
    });

    it('should return correct products when users complete a search', (done) => {
      const search = 'Peanut Butter'

      chai
        .request(server)
        .get(`/api/products?query=${search}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(1);
          done();
        });
    });

    it('should return a 404 response if inventory is not found', (done) => {
      const search = 'Dior'
      chai
        .request(server)
        .get(`/api/products?query=${search}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
})

describe('Login', () => {

  describe('POST /api/login', () => {

    it('should successfully log user in with valid credentials and return user data', (done) => {
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
          done();
        });
    });

    it('should handle incorrect username or password with 401 response', (done) => {
      let credentials = {
        username: 'jimbobjoe16',
        password: 'helloworld'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(401)
          done();
        });
    });

    it('should handle missing password with a 400 response', (done) => {
      let credentials = {
        username: 'jimbobjoe16',
        password: ''
      };

      chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(400)
          done();
        })
    })
  });
});

describe('Cart', () => {

  describe('GET /api/me/cart', () => {

    const accessToken = "aZVg8xUr8PVZNk3G"

    it('should return the users shopping cart', (done) => {

      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.should.be.lengthOf(0);
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




    it('should update the users shopping cart with item they selected', (done) => {
      const accessToken = "aZVg8xUr8PVZNk3G"
      const cartItem = { id: '10' }
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('cart').which.is.an('array')
          res.body.cart.length.should.be.above(0);
          res.body.cart[0].should.have.property('id').eql('10')
          done();
        });
    });

    it('should return a 404 if product is not found', (done) => {
      const accessToken = "aZVg8xUr8PVZNk3G"
      const cartItem = { id: '17' }
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${accessToken}`)
        .send(cartItem)
        .end((err, res) => {
          res.should.have.status(404)
          done();
        })
    })


    it('should return a 401 if user is not authenticated', (done) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401)
          done();
        });
    });
  });

  describe('DELETE /api/me/cart/{productId}', () => {


    it('should successfully remove a product from the users cart', (done) => {

      const accessToken = 'aZVg8xUr8PVZNk3G'
      const productId = '10';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });
  });

  describe('POST /api/me/cart/{productId}', () => {
    const accessToken = 'krkR5itCRUSGrw1N'
    const productToUpdate = { id: '10', quantity: 2 }

    it('should update a product from the users cart by product ID', (done) => {

      chai
        .request(server)
        .post(`/api/me/cart/${productToUpdate.id}?accessToken=${accessToken}`)
        .send(productToUpdate)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        })
    })

    it('should return a 404 if the product does not exist', (done) => {

      const accessToken = 'krkR5itCRUSGrw1N'
      const productToUpdate = { id: '12', quantity: 2 }

      chai
        .request(server)
        .post(`/api/me/cart/${productToUpdate.id}?accessToken=${accessToken}`)
        .send(productToUpdate)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })

    it('should return a 401 if user is not authenticated', (done) => {

      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401)
          done();
        });
    })
  })

});
