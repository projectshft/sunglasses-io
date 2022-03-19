const server = require('../app/server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { uid } = require('rand-token');

should = chai.should();
chai.use(chaiHttp);

//Sunglasses
describe('Sunglasses', () => {
  describe('Get sunglasses', () => {
    it('Should get all products', (done) => {
      chai
        .request(server)
        .get('/api/sunglasses')
        .end((err, res) => {
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
        })
    })

    it('Valid search returns an array', (done) => {
      chai
        .request(server)
        .get('/api/sunglasses?q=Glasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(6);
          done();
        })
    })

    it('Invalid search throws error', (done) => {
      chai 
        .request(server)
        .get('/api/sunglasses?q=cats')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })

    it('Blank search returns all products', done => {
      chai 
        .request(server)
        .get('/api/sunglasses?q=')
        .end((err, res) => {
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
})

//Brands
describe('Brands', () => {
  describe('Get brands', () => {
    it('Should return all brands', done => {
      chai 
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          res.body[0].should.have.keys('id', 'name');
          done();
        })
      })
  })

  describe('Get brands products', () => {
    it('Should return brands sunglasses', done => { 
      chai
        .request(server)
        .get('/api/brands/1/sunglasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
          res.body.length.should.be.eql(3);
          done();
        })
    })

    it('Throws error if not a valid brand', done => {
      chai 
        .request(server)
        .get('/api/brands/6/sunglasses')
        .end((err, res) => {
          res.should.have.status(404);
          done()
        })    
    })
  })
})

// login + token 
describe('User', () => {
  describe('Checks user login', () => {
    it('Should throw if any incorrect username and password, or if left blank ', done => {
      chai
        .request(server)
        .post('/api/me')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.a('string');
          done();
        })
    })

    it('Should return user when correct login is used', done => {
      const login = {
        "username": "yellowleopard753",
        "password": "jonjon"
      }
      chai
        .request(server)
        .post('/api/me')
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        })
    })
    it('Should throw error if incorrect username or password', done => {
      const login = {
        "username": "yellowleopard753",
        "password": "wrong"
      }
      chai
        .request(server)
        .post('/api/me')
        .send(login)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.a('string');
          done();
        })
    })
  })
})

// /me/cart 
describe('Cart => GET', () => {
  let tempToken = ''
  before('login token exists', (done) => {
    chai
      .request(server)
      .post("/api/me")
      .send({username: "yellowleopard753", password: "jonjon" })
      .end((err, res) => {
        res.should.have.status(200);
        tempToken=res.body;
       done();
      })
  })
  describe('cart => GET', () => {
    it('Should return an empty cart object', done => {
      chai
        .request(server) 
        .get('/api/me/cart')
        .query({'token': tempToken})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body.length.should.be.eql(0)
          done();
        })
    })
    
    it('Should throw error if incorrect or no access token', done => {
      chai  
        .request(server)
        .get('/api/me/cart')
        .query({'token': ''})
        .end((err, res) => {
          res.should.have.status(400)
          done();
        })
    })
  })
})

// cart add and remove and quantity
describe('Cart add + remove', () => {
  const product = {
    "id": 2,
    "name": "Black Sunglasses"
  }
  const product2 = {
    "name": "Brown Sunglasses"
  }
  before('login token exists', (done) => {
    chai
      .request(server)
      .post("/api/me")
      .send({username: "yellowleopard753", password: "jonjon" })
      .end((err, res) => {
        res.should.have.status(200);
        tempToken=res.body;
       done();
      })
  })
  before('Adds different item to cart for quantity', done => {
    chai
        .request(server)
        .post('/api/me/cart/2/add')
        .query({'token': tempToken})
        .send(product2)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(1)
          done();
        })
  })
  //add to cart
  describe('Add to cart', () => {
    it('Should add a product to a users cart', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/add')
        .query({'token': tempToken})
        .send(product)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(2)
          done();
        })
    })
    it('Should throw error if token does not match user database', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/add')
        .query({'token': 'hello there'})
        .send(product)
        .end((err, res) => {
          res.should.have.status(400)
          done();
        })
    })
    it('Should throw error if invalid product is added to cart', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/add')
        .query({'token': tempToken})
        .send('does not work')
        .end((err, res) => {
          res.should.have.status(401)
          done();
        })
    })
  })
  // remove
  describe('Remove from cart', () => {
    it('Should remove item from cart', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/remove')
        .query({'token': tempToken})
        .send(product)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(1)
          done();
        })
    })
    it('Should throw error if token does not match user database', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/remove')
        .query({'token': 'hello there'})
        .send(product)
        .end((err, res) => {
          res.should.have.status(400)
          done();
        })
    })
    it('Should throw error if invalid product is removed', done => {
      chai
        .request(server)
        .post('/api/me/cart/2/add')
        .query({'token': tempToken})
        .send('does not work')
        .end((err, res) => {
          res.should.have.status(401)
          done();
        })
    })
  })
  //quantity
  describe('cart quantity', () => {
    it('Should set cart quantity to a higher number', done => {
      chai 
      .request(server)
      .post('/api/me/cart/3/quantity')
      .query({'token': tempToken})
      .send({"quantity": 10})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.be.eql(1)
        res.body[0].quantity.should.be.eql(10)
        done();
      })
    })
    it('Should not allow setting numbers less than 1', done =>{
      chai 
      .request(server)
      .post('/api/me/cart/3/quantity')
      .query({'token': tempToken})
      .send({"quantity": -1})
      .end((err, res) => {
        res.should.have.status(401);
        done()
      })
    })
    it('Should throw error if token does not match user database', done => {
      chai
        .request(server)
        .post('/api/me/cart/3/quantity')
        .query({'token': 'hello there'})
        .send({"quantity": 10})
        .end((err, res) => {
          res.should.have.status(400)
          done();
        })
    })
  })
})