let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

// Brands
describe('Brands', () => {

  // GET /api/brands
  describe('GET /api/brands', () => {
    it('it should get all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  })

  // GET /api/brands/{brandId}/products
  describe('GET /api/brands/{brandId}/products', () => {
    it('it should get all the products of a given brand', (done) => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });

    it('it should return a 400 error if the brand ID is not a positive integer', (done) => {
      chai
        .request(server)
        .get('/api/brands/a/products')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('it should return a 404 error if a given brand does not exist', (done) => {
      chai
        .request(server)
        .get('/api/brands/6/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })
})

// Products
describe('Products', () => {

  // GET /api/products
  describe('GET /api/products', () => {
    it('it should get all the products if no search term is provided', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });

    it('it should get only products matching the search term if one is provided', (done) => {
      let searchTerm = 'Habanero';

      chai
        .request(server)
        .get(`/api/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });    
  })
})

// Login
describe('Login', () => {
  
  // POST /api/login
  describe('POST /api/login', () => {
    it('should successfully log in a user if correct username and password are provided', (done) => {
      let loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    })

    it('should return a 400 error if invalid username and/or password are provided', (done) => {
      let loginInfo = {
        username: 'yellowleopard753',
        password: 'waters'
      };

      chai
        .request(server)
        .post('/api/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    })
  })
})

// Cart
describe('Cart', () => {

  // GET /api/me/cart
  describe('GET /api/me/cart', () => {
    beforeEach(() => {
      user.cart = [];
    });

    it('should return an empty array before any items are added', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        })
    })

    it('should return an array with the added items after any are added', (done) => {
      product = products[0];
      user.cart.push(product);

      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          done();
        })
    })

    it('should return a 401 error if user is not logged in', (done) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })
  })

  // POST /api/me/cart
  describe('POST /api/me/cart', () => {

    it('should add an item to a user\'s cart given a product ID', (done) => {
      let productId = '1';

      chai
        .request(server)
        .post('/api/me/cart')
        .send(productId)
        .end((err, res) => {
          res.should.have.status(200);
        })
    })

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      let productId = 'a';

      chai
        .request(server)
        .post('/api/me/cart')
        .send(productId)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    
    it('should return a 401 error if user is not logged in', (done) => {
      let productId = '1';

      chai
        .request(server)
        .post('/api/me/cart')
        .send(productId)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })

    it('it should return a 404 error if a given product does not exist', (done) => {
      let productId = '12';

      chai
        .request(server)
        .get('/api/me/cart')
        .send(productId)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })

  // DELETE /api/me/cart/{productId}
  describe('DELETE /api/me/cart/{productId}', () => {

    it('should delete an item from a user\'s cart given a product ID', (done) => {
      let productId = '1';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(200);
        })
    })

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      let productId = 'a';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    
    it('should return a 401 error if user is not logged in', (done) => {
      let productId = '1';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })

    it('it should return a 404 error if a given product does not exist', (done) => {
      let productId = '12';

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })

  // PUT /api/me/cart/{productId}
  describe('PUT /api/me/cart/{productId}', () => {

    it('should update an item from a user\'s cart given a product ID', (done) => {
      let productId = '1';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(200);
        })
    })

    it('it should return a 400 error if the product ID is not a positive integer', (done) => {
      let productId = 'a';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    
    it('should return a 401 error if user is not logged in', (done) => {
      let productId = '1';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })

    it('it should return a 404 error if a given product does not exist', (done) => {
      let productId = '12';
      let updatedProduct;

      chai
        .request(server)
        .put(`/api/me/cart/${productId}`)
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })
})

// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId