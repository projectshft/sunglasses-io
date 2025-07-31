const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

describe('GET /brands', () => {
  it('should return an array of all brands', (done) => {
    chai
      .request(server)
      .get('/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  }); 
});

describe('/GET products', () => {
  it('should return an array of ALL products from all brands', (done) => {
    chai
      .request(server)
      .get('/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('/GET brands/:id/products', () => {
  it('should return array of products for a given brand', (done) => {
    
    const brandId = 1;
      
    chai
      .request(server)
      .get(`/brands/${brandId}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.every(product => product.categoryId == brandId).should.be.true;
        done();
      });
    
  });

  it('should return 404 if no products found for given brand id', (done) => {
    chai.request(server)
      .get('/brands/xyz/products')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('error').eql('No products found for this brand');
        done();
      });
  });

});

describe('POST /login', () => {
  it('should login user and return token', (done) => {
    const loginInfo = { username: 'lazywolf342', password: 'tucker' };
    chai
      .request(server)
      .post('/login')
      .send(loginInfo)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('token');
        done();
      });
  });
  it('should return 401 code for invalid login', (done) => {
    const loginInfo = {
      username: 'RandomGuy',
      password: 'qwerty'
    };
    chai
      .request(server)
      .post('/login')
      .send(loginInfo)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('error').eql('Invalid login info');
        done();
      });
  });
});


describe('GET /me/cart', () => {
  let token;
  
  before((done) => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it('should return cart for authenticated user', (done) => {
    chai
      .request(server)
      .get('/me/cart')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });

});

describe('POST /me/cart', () => {
  let token;
  let addToCart;

  before((done) => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });
  
  it('should add product to me/cart', (done) => {
    addToCart = { productId: '1', quantity: 5 };

    chai
      .request(server)
      .post('/me/cart')
      .set('Authorization', `Bearer ${token}`)
      .send(addToCart)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.deep.include({ productId: '1', quantity: 5 });
        done();
      });
  });
});

describe ('DELETE /me/cart/:productId', () => {
  let token;
  before((done) => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        token = res.body.token;
        chai
          .request(server)
          .post('/me/cart')
          .set('Authorization', `Bearer ${token}`)
          .send({ productId: '1', quantity: 5 })
          .end(() => done());
      });
  });

  it('should delete the item from cart', (done) => {
    chai
      .request(server)
      .delete('/me/cart/1')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.not.deep.include({ productId: 1, quantity: 2 });
        done();
      });
  });

});

describe ('PUT /me/cart/:productId', () => {
  let token;
  before((done) => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        token = res.body.token;
        chai
          .request(server)
          .post('/me/cart')
          .set('Authorization', `Bearer ${token}`)
          .send({ productId: '1', quantity: 5 })
          .end(() => done());
      });
  });

  it('should update quantity of given item in cart', (done) => {
    chai
      .request(server)
      .put('/me/cart/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 10 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.deep.include({ productId: '1', quantity: 10 });
        done();
      });
  });

});