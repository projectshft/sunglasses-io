let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);

describe('User', () => {

  // Test to make sure the GET cart route is only accessible by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message if user is not logged in', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test POST /me/cart route to only be accessed by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message if user is not logged in', done => {
      chai
        .request(server)
        .post('/me/cart')
        .send({
          'productQuantity': '445',
          'productId': '1'
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test DELETE route to only be accessed by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message if user is not logged in', done => {
      chai
        .request(server)
        .delete('/me/cart/2')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test the POST /me/cart/:productId route to only be accessed by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message if user is not logged in', done => {
      chai
        .request(server)
        .post('/me/cart/2')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test to make sure the GET cart route is only accessible by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message if user is not logged in', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test successfully getting the cart for a user
  describe('/GET get cart', () => {
    it('it should get the cart for a user after they log in', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // get user's cart
          chai
            .request(server)
            .get(`/me/cart?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(0);
              done();
            })
        });
    })
  });

  // Test getting the user's cart after adding 3 products
  describe('/POST cart', () => {
    it('it should show the user"s cart after adding 3 items', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add three different products to the user's cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/2?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/3?token=${res.body.token}`)
            .end()
          // delete a product that does not exists in the user's cart
          chai
            .request(server)
            .get(`/me/cart/?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(3);
              done();
            })
        })
    })
  })

  // Test successfully updating the quantity of a product in the user's cart
  describe('/POST cart', () => {
    it('it should update the quantity for a product in the cart', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add product to cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end()
          // update product quantity  
          chai
            .request(server)
            .post(`/me/cart?token=${res.body.token}`)
            .send({
              'productQuantity': '445',
              'productId': '1'
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.quantity.should.be.eql(445)
              res.body.product.name.should.be.eql('Superglasses')
              done();
            })
        })
    })
  })

  // Test updating a product that does not exists
  describe('/POST cart', () => {
    it('it should show an error message if the product to be updated does not exits', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add product to cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end()
          // update product quantity  
          chai
            .request(server)
            .post(`/me/cart?token=${res.body.token}`)
            .send({
              'productQuantity': '445',
              'productId': '341'
            })
            .end((err, res) => {
              res.should.have.status(404);
              res.body.message.should.be.eql('Product not found')
              done();
            })
        })
    })
  })

  // Test successfully adding a product to a users cart
  describe('/POST product to cart', () => {
    it('it should add a product to the user"s cart', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add product to cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.product.name.should.be.eql('Superglasses')
              done();
            })
        })
    })
  })

  // Test adding a product that does not exists
  describe('/POST product to cart', () => {
    it('it should show an error message if the product to be added does not exits', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add product to cart
          chai
            .request(server)
            .post(`/me/cart/143?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(404);
              res.body.should.be.a('object');
              res.body.message.should.be.eql('Product not found')
              done();
            })
        })
    })
  });

  // Test successfully deleting a product 
  describe('/POST cart', () => {
    it('it should remove a product from the user"s cart', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add three different products to the user's cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/2?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/3?token=${res.body.token}`)
            .end()
          // delete one product from the user's cart
          chai
            .request(server)
            .delete(`/me/cart/1?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.length.should.be.eql(2);
              done();
            })
        })
    })
  })

  // Test deleting a product that does not exits
  describe('/POST cart', () => {
    it('it should show an error message if the product to be deleted does not exits', done => {
      // log user in
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          // add three different products to the user's cart
          chai
            .request(server)
            .post(`/me/cart/1?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/2?token=${res.body.token}`)
            .end()
          chai
            .request(server)
            .post(`/me/cart/3?token=${res.body.token}`)
            .end()
          // delete a product that does not exists in the user's cart
          chai
            .request(server)
            .delete(`/me/cart/143?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(404);
              res.body.message.should.be.eql('Product not found');
              done();
            })
        })
    })
  })

});
