let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server')
let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
    describe('/GET api/brands', () => {
      it('it should GET all the brands', done => {
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
    });
  
    describe('/GET api/brands/:id/products', () => {
        it('it should GET all the products of a specific brand', done => {
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

        it('it should return a 404 if the ID does not exist', done => {
          chai
            .request(server)
            .get('/api/brands/8/products') 
            .end((err, res) => {
                res.should.have.status(404);
                done();
              });
        })
      });
    
  });

describe('Products', () => {
    describe('/GET api/products', () => {
      it('it should GET all the products available', done => {
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
    });
});

describe('Login', () => {
  describe('/POST api/login', () => {
    it('it should POST users login and return access token', done => {
      chai
        .request(server)
        .post('/api/login')
        .set({'Content-Type': 'application/json'})
        .send({
          username: "lazywolf342",
          password: "tucker"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
          res.body.length.should.be.eql(16);
          done();
        });
    });
    it('it should return an error if username is invalid', done => {
      chai
        .request(server)
        .post('/api/login')
        .set({'Content-Type': 'application/json'})
        .send({
          username: "bananna",
          password: "tucker"
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('it should return an error if password is invalid', done => {
      chai
        .request(server)
        .post('/api/login')
        .set({'Content-Type': 'application/json'})
        .send({
          username: "lazywolf342",
          password: "bananna"
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it('it should return an error if username or password are missing', done => {
      chai
        .request(server)
        .post('/api/login')
        .set({'Content-Type': 'application/json'})
        .send({
          username: "",
          password: ""
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

describe('User', () => {
  describe('/GET me/cart', () => {
    it('it should GET the cart contents of the current user', done => {
      let currentUser = {
        username: "lazywolf342",
        password: "tucker"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(currentUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
              chai
              .request(server)
              .get('/api/me/cart/?accessToken=' + res.body)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array')
                res.body.length.should.be.eql(0)
                done();
          });
      });
    });

  
    it('it should not GET cart contents of user without access token', done => {
        let currentUser = {
          username: "lazywolf342",
          password: "tucker"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(currentUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
              chai
              .request(server)
              .get('/api/me/cart')
              .end((err, res) => {
                res.should.have.status(401);
                done();
              });
          });
    });
  });
  
  describe('/POST me/cart', () => {
    it('it should POST items to the users cart', done => {
      let currentUser = {
        username: "lazywolf342",
        password: "tucker"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(currentUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
          let addedProduct = {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price": 150,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
            chai
              .request(server)
              .post('/api/me/cart/?accessToken=' + res.body)
              .send(addedProduct)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array')
                res.body.length.should.be.eql(1)
                res.body[0].quantity.should.be.eql(1)
                done();
              });
          });
    });

  });

  describe('/PUT me/cart/:productId', () => {
    it('it should update the quantity of an item in the users cart', done => {
      let currentUser = {
        username: "lazywolf342",
        password: "tucker"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(currentUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
             chai
              .request(server)
              .put('/api/me/cart/1/?accessToken=' + res.body)
              .send({quantity: 2})
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array')
                res.body[0].quantity.should.be.eql(2)
                done();
              });
          });
    });

  });

  describe('/DELETE me/cart/:productId', () => {
    it('it should DELETE an item in the users cart', done => {
      let currentUser = {
        username: "lazywolf342",
        password: "tucker"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(currentUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
            chai
              .request(server)
              .delete('/api/me/cart/1/?accessToken=' + res.body)
              .send()
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array')
                res.body.length.should.be.eql(0)
                done();
              });
          });
    });

  });

  
  
});