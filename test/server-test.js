let server = require('../app/server');

let chai = require('chai');
let chaiHttp = require('chai-http');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET products', () => {
    it('it should get all the sunglasses in the store', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
})


describe('/GET Brands', () => {
  it('it should get all brands', (done) => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eq(5);
        done();
      })
  })
})


describe('Get sunglasses by brand', () => {
  describe('/GET sunglasses by brand', () => {
    it('it should get all sunglasses of specific brand', (done) => {
    
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        })
    })
    it('it should return an error if a brand with no sunglasses is entered', (done) => {
      chai
        .request(server)
        .get('/api/brands/6/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  })
})

describe('Login request', () => {
  describe('/POST username and password to recieve an access token', () => {
    it('it should provide an access token for a correct login', (done) => {
      let user = {
        "username": "yellowleopard753",
        "password": "jonjon"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
          res.body.length.should.be.eql(16)
          done();
        })
    })
    it('it should throw error 401 if the username is incorrect', (done) => {
      let user = {
        "username": "greenleopard752",
        "password": "jonjon"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })
    it('it should throw error 401 if the password is incorrect', (done) => {
      let user = {
        "username": "yellowleopard753",
        "password": "jon"
      }
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })
    it('it should throw error 400 if the password is missing', (done) => {
      let user = {
        "username": "yellowleopard753",
      }
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
});

describe('Cart', () => {
  let accessToken = ''
  before('login to get access', () => {
    let user = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    chai
    .request(server)
    .post('/api/login')
    .send(user)
    .end((err, res) => {
      accessToken = res.body;
    })
  })
  describe('/GET cart', () => {
    it('should return a cart from the user', (done) => {
      chai
      .request(server)
      .get('/me/cart')
      .query({accessToken: accessToken})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.shoudl.be.an("array");
        done();
      });
    });
  it("should throw an error if user is not logged in", done => {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});
  describe('/POST to add to cart', () => {
    it('should return a cart with products including the one just added', (done) => {
      const newSunglasses = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      chai
        .request(server)
        .post('/me/cart')
        .query({accessToken: accessToken})
        .send(newSunglasses)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
    it('should not return a cart if the user does not have an access token', (done) => {
      chai
        .request(server)
        .post('/me/cart')
        .send(newSunglasses)
        .end((err, res) => {
          err.should.have.status(401);
          done();
        })
    })
  })
  describe('/DELETE item from cart', () => {
    it('should return a cart with one product without the one deleted', (done) => {
      const oldSunglasses = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      } 
      chai
        .request(server)
        .delete('/me/cart')
        .query({accessToken: accessToken})
        .send(oldSunglasses)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        })
    })
  })
  describe('/PUT to change quantity of item in cart', () => {
    it('should return a cart with updatd quantity', (done) => {
      const newQuant = {
        count: 2
      }
      chai
        .request(server)
        .delete('/me/cart')
        .query({accessToken: accessToken})
        .send(newQuant)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.count.should.be.eql(2);
          done();
        })
    })
  })
})