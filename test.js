let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
  it('it should GET all brands', done => {
    chai
      .request(server)
      .get('/brands')
      .end((err,res) => {
        res.should.have.status(200);
        res.should.be.an('array');
        done();
      });
  });
});

describe('/GET products by brand', () => {
  it('it should GET all products by brand', done => {
    chai
      .request(server)
      .get('/brands/:id')
      .end((err,res) => {
        res.should.have.status(200);
        res.should.be.an('array');
      });
  });
});

describe('/GET products', () => {
  it('it should GET all products', done => {
    chai
      .request(server)
      .get('/prducts')
      .end((err,res) => {
        res.should.have.status(200);
        res.should.be.an('array');
        done();
      });
  });
});

describe('/POST login', () => {
  it('it should POST user login', done => {
    chai
      .request(server)
      .post('/login')
      .end((err,res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res.body.should.have.property('password');
        done();
      })
  });
});

describe('The Cart', () => {
  describe('/GET cart', () => {
    it('it should GET cart', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an('array');

        });
    });
  });

  describe('/POST cart', () => {
    it('it should POST to cart', done => {
      chai
        .request(server)
        .post('/me/cart')
        .end((err, res) => {
          res.should.have.status(200);

      });
    })
  })
});

describe('The Products in the Cart', () => {
  describe('/DELETE product', () => {
    it('it should DELETE product in cart', done => {
      chai
        .request(server)
        .delete('/me/cart/:productId')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an('object');
        });
    });
  });

  describe('/POST product', () => {
    it('it should add product in cart', done => {
      chai
        .request(server)
        .post('/me/cart/:productId')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an('object');
        });
    });
  });
});
