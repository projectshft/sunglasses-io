const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server.js');
require('should-http');
const { send } = require('process');

chai.use(chaiHttp);

describe('/products', () => {
  it('should return a list of all products', done => {
    chai
      .request(server)
      .get('/products')
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.an('array');
        done();
      });
  });
});

  describe('/products/:id', () => {
    it('should return a single product with the specified id', (done) => {
      let id = '1';
      chai
        .request(server)
        .get(`/products/${id}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          done();
        });
    });
    it('should return a 404 error if product does not exist', (done) =>{
      chai
      .request(server)
      .get('/products/9000')
      .end((err, res) => {
        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.message).to.equal('Product simply does not exist');
        done();
      });
    })
});

describe('/cart', () => {
  it('should return a list of the items in a users cart', (done) => {
    chai
      .request(server)
      .get('/cart')
      .set('access-token', 'qwertyuiopasdfgh')
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.an('array');
        done();
      });
  });
  it('should return a 401 error if the user does not have a valid access token', (done) =>{
    chai
    .request(server)
    .get('/cart')
    .end((err, res) => {
      chai.expect(res.status).to.equal(401);
      chai.expect(res.body.message).to.equal('You have no face. How can a man with no face have a cart?');
      done();
    });
  })
});

describe('/cart', () => {
  it('should add an item to the cart', (done) =>{
    chai
    .request(server)
    .post('/cart')
    .set('access-token', 'qwertyuiopasdfgh')
    .send({productId: '1'})
    .end((err, res) => {
      chai.expect(res.status).to.equal(200);
      chai.expect(res.body).to.be.an('array');
      chai.expect(res.body).to.have.length.at.least(1);
      done();
    });
  })
  it('should return a 401 error if invalid item is added to cart', (done) =>{
    chai
    .request(server)
    .post('/cart')
    .set('access-token', 'qwertyuiopasdfgh')
    .send({productId: '9000'})
    .end((err, res) => {
      chai.expect(res.status).to.equal(401);
      chai.expect(res.body.message).to.equal('that item simply does not exist')
      done();
    });
  })
  it('should return 401 error if there is no access token', (done) =>{
    chai
    .request(server)
    .post('/cart')
    .send({productId: '1'})
    .end((err, res) => {
      chai.expect(res.status).to.equal(401);
      chai.expect(res.body.message).to.equal('A man has no face. A man with no face cannot add to a cart.')
      done();
    });
  })
  // it ('should delete an item from the cart', (done) => {
  //   chai
  //   .request(server)
  //   .delete(`/cart`)
  //   .set('access-token', 'qwertyuiopasdfgh')
  //   .send({productId: '1'})
  //   .end((err, res) => {
  //     chai.expect(res.status).to.equal(200);
  //     chai.expect(res.body).to.be.an('array');
  //     chai.expect(res.body).to.not.include({id: '1'});
  //     done();
  //   });
  // })
})


describe('/login', () => {
  it('should return an access token to the header', (done) => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.a('string');
        done();
      });
  });
  it('should return a 401 error if the user name or password do not exist', (done) =>{
    chai
    .request(server)
    .post('/login')
    .send({ username: 'faceless', password: 'man' })
    .end((err, res) => {
      chai.expect(res.status).to.equal(401);
      chai.expect(res.body.message).to.equal('Could not find either that user name or password. Maybe it is my fault. But maybe it is yours?');
      done();
    });
  })
});

