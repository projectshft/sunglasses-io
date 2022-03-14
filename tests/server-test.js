const server = require('../app/server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const uids = require('../data/uids');

chai.should();
chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('GET all Sunglasses', () => {
    it('should return an array of sunglasses', (done) => {
      chai.request(server).get("/sunglasses").end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('brandId');
        res.body[0].should.have.property('name');
        res.body[0].should.have.property('description');
        res.body[0].should.have.property('imageUrls');
        res.body[0].should.have.property('inStock');
        res.body[0].should.have.property('price');
        done();
      }) 
    })
    it('should return an array when a query is entered', (done) => {
      const query = {
        search: "brown"
      };

      chai.request(server)
        .get('/sunglasses')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].id.should.equal('3');
          done();
        })
    })
    it('should return only inStock items if specified', (done) => {
      const query = {
        inStock: 'true'
      };

      chai.request(server)
        .get('/sunglasses')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].inStock.should.equal(true);
          done();
        })
    })
    it('should not return anything if the inStock query is invalid', (done) => {
      const query = {
        inStock: 'blah',
      };

      chai.request(server)
        .get('/sunglasses')
        .query(query)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.not.be.an('object')
          done();
        })
    })
    it('should not return anything if the search is invalid', (done) => {
      const query = {
        search: '',
      };

      chai.request(server)
        .get('/sunglasses')
        .query(query)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.not.be.an('array');
          done();
        })
    })
  })
  describe('GET sunglasses by id', () => {
    it('should return a sunglasses object', (done) => {

      chai.request(server)
        .get('/sunglasses/2')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.id.should.equal('2');
          done();
        })
    })
    it('should return an error if the id is invalid', (done) => {

      chai.request(server)
        .get('/sunglasses/fhdjskfh')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an('object');
          done();
        })
    })
  })
});

describe('Brands', () => {
  describe('GET all brands', () => {
    it('should return an array of brands', (done) => {

      chai.request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');
          done();
        })
    })
  })
  describe('GET sunglasses by brand id', () => {
    it('should return an array of sunglasses', (done) => {

      chai.request(server)
        .get('/brands/1/sunglasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('inStock');
          done();
        })
    })
    it('should not return sunglasses if the brand id does not exist/is invalid', (done) => {

      chai.request(server)
        .get('/brands/450000/sunglasses')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('inStock');
          res.body.should.not.have.property('brandId');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('imageUrls');
          res.body.should.not.have.property('name');
          res.body.should.not.have.property('description');
          done();
        })
    })
  })
});

describe('Login', () => {
  describe('the POST login endpoint', () => {
    it('should return a valid token', (done) => {
      const login = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }

      chai.request(server)
        .post('/login')
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          res.body.length.should.be(16);
          done();
        })
    })
    it('should return an error if the username/password is incorrect', (done) => {
      const fakeLogin = {
        username: 'dsfdfde',
        password: '7886highjk'
      }

      chai.request(server)
        .post('/login')
        .send(fakeLogin)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.a('string');
          res.body.length.should.not.be(16);
          done();
        })
    })
    it('should return an error if no username or password is given', (done) => {
      
      chai.request(server)
        .post('/login')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.a('string');
          res.body.length.should.not.be(16);
          done();
        })
    })
  })
});

describe('Cart', () => {
  describe('GET all cart items', () => {
    it('should return a cart object', (done) => {
      const query = {
        accessToken: uid[0]
      }

      chai.request(server)
        .get('/me/cart')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.all.keys('items', 'quantities');
          done();
        })
    })
    it('should return an error if the token is invalid', (done) => {
      const query = {
        accessToken: '738463674hjdjdjfsjkhgfh'
      }

      chai.request(server)
        .get('/me/cart')
        .query(query)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.have.all.keys('items', 'quantities');
          done();
        })
    })
  })
  describe('Add items to the cart', () => {
    it('should add a single item if quantity is not specified', (done) => {
      const query = {
        accessToken: uid[0],
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(1);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should add a single item if quantity is empty', (done) => {
      const query = {
        accessToken: uid[0],
        quantity: ''
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(1);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should add the specified number of items to the cart', (done) => {
      const query = {
        accessToken: uid[0],
        quantity: '6'
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(6);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should not add items if the access token is invalid', (done) => {
      const query = {
        accessToken: '6789678967jhkdqg',
        quantity: '6'
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.an('array');
          res.body[0].should.not.have.property('id');
          done();
        })
    })
    it('should not add items if the quantity is invalid', (done) => {
      const query = {
        accessToken: uids[0],
        quantity: 'null'
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.not.be.an('array');
          res.body[0].should.not.have.property('id');
          res.body[0].should.not.have.property('inStock');
          done();
        })
    })
    it('should not add items if the quantity is too large', (done) => {
      const query = {
        accessToken: uids[0],
        quantity: '300'
      }

      chai.request(server)
        .get('/me/cart/4/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should not add items if there is no access token', (done) => {

      chai.request(server)
        .get('/me/cart/4/add')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should not add items if the sunglasses ID is invalid', (done) => {
      const query = {
        accessToken: uids[0],
      }

      chai.request(server)
        .get('/me/cart/hufih7876/add')
        .query(query)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
  })
  describe('DELETE items from the cart', () => {
    it('should remove a single item if quantity is not specified', (done) => {
      const query = {
        accessToken: uid[0],
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(1);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should remove a single item if quantity is empty', (done) => {
      const query = {
        accessToken: uid[0],
        quantity: ''
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(1);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should remove the specified number of items from the cart', (done) => {
      const query = {
        accessToken: uid[0],
        quantity: '2'
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(2);
          res.body[0].id.should.equal(4);
          done();
        })
    })
    it('should not delete items if the access token is invalid', (done) => {
      const query = {
        accessToken: '6789678967jhkdqg',
        quantity: '2'
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should not remove items if the quantity is invalid', (done) => {
      const query = {
        accessToken: uids[0],
        quantity: 'null'
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should remove all items if the quantity is more than the cart has', (done) => {
      const query = {
        accessToken: uids[0],
        quantity: '4'
      }

      chai.request(server)
        .get('/me/cart/4/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.equal(3);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('inStock');
          done();
        })
    })
    it('should not remove items if there is no access token', (done) => {

      chai.request(server)
        .get('/me/cart/4/remove')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should not remove items if the sunglasses ID is invalid', (done) => {
      const query = {
        accessToken: uids[0],
      }

      chai.request(server)
        .get('/me/cart/hufih7876/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
    it('should not remove items if the sunglasses ID is not in the cart', (done) => {
      const query = {
        accessToken: uids[0],
      }

      chai.request(server)
        .get('/me/cart/1/remove')
        .query(query)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an('array');
          res.body.should.not.have.property('id');
          res.body.should.not.have.property('inStock');
          done();
        })
    })
  })
});