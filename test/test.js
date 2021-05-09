let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET brands', () => {
    it('It should GET all the brands in the store', (done) => {
      chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
        });
    })
  })
  describe('/GET api/brands/:id/products', () => {
    it('It should GET all products for given brand id', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    })
    it('It should return an error with an invalid brand id', done => {
      chai
        .request(server)
        .get('/api/brands/x/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  })
})

describe('Products', () => {
  describe('/GET products', () => {
  it('It should GET all the products in the store', (done) => {
    chai
      .request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
        done();
      });
  })
  it('It should limit results to those which description contains the querry string', (done) => {
    chai
      .request(server)
      .get('/api/products?query=best')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(4);
        done();
      });
  })
})
})

describe('Login', () => {
  describe('/POST /api/me/login', () => {
  it('It should return access token with valid login', (done) => {
    let testUser = {
      username: 'lazywolf342',
      password: 'tucker',
    };
    chai
      .request(server)
      .post('/api/me/login')
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(200);
        
        done();
      });
  })
  it('It should return 400 error if missing login parameter', (done) => {
    let testUser = {
      username: 'lazywolf342',
    };
    chai
      .request(server)
      .post('/api/me/login')
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(400);

        done();
      });
  })
  it('It should return 401 error if invalid login', (done) => {
    let testUser = {
      username: 'lazywolf342',
      password: 'wrongPassword'
    };
    chai
      .request(server)
      .post('/api/me/login')
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  })
})
})

describe('Cart', () => {
  let accessToken = ''
  before('login a user', () => {
    let testUser = {username: 'lazywolf342', password: 'tucker'};
    chai
      .request(server)
      .post('/api/me/login')
      .send(testUser)
      .end((err, res) => {
        accessToken = res.body
      });
  })
  describe('/GET /api/me/cart', () => {
  it('It should GET a logged-in users shopping cart', (done) => {
    chai
      .request(server)
      .get('/api/me/cart')
      .set('accessToken', accessToken)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
    })
  })
  describe('/POST /api/me/cart', () => {
    it('It should POST an item to a logged-in users shopping cart', (done) => {
      let testItem = {
        productId: 1,
        quantity: 1
      }
      chai
        .request(server)
        .post('/api/me/cart')
        .set('accessToken', accessToken)
        .send(testItem)
        .end((err, res) => {
          console.log(res.body[0])
          res.should.have.status(200);
          done();
        });
      })
    })
  describe('/POST /api/me/cart/:productId', () => {
      it('It should POST an item, updated item quantity for logged-in users shopping cart', (done) => {
        let testItem = {
          productId: '1',
          quantity: 5
        }
        chai
          .request(server)
          .post('/api/me/cart/1')
          .set('accessToken', accessToken)
          .send(testItem)
          .end((err, res) => {
            console.log(res.body[0])
            res.should.have.status(200);
            done();
          });
        })
      })
  describe('/DELETE /api/me/cart/:productId', () => {
    it('It should DELETE a product by Id for a logged in user', (done) => {
      chai
        .request(server)
        .delete('/api/me/cart/1')
        .set('accessToken', accessToken)
        .end((err, res) => {
          console.log(res.body[0])
          res.should.have.status(200);
          done();
        });
      })
    })
  
})

