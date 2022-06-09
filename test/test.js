let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server.js');

let should = chai.should();

chai.use(chaiHttp);

// beforeEach(() => {
//   server.removeAll();
// });

describe('/GET brands', () => {
  it('it should GET all brands', done => {
    chai
      .request(server)
      .get('/brands')
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        // res.body.length.should.be.eql(0);

        // res.deepEqual(
        //   { id: '1', name: 'Oakley' },
        //   { id: '2', name: 'Ray Ban' },
        //   { id: '3', name: "Levi's" },
        //   { id: '4', name: 'DKNY' },
        //   { id: '5', name: 'Burberry' }
        // );
        // res.body.should.be.a('object');
        // res.body.should.have.property('id');
        // res.body.should.have.property('name');
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
        done();
      });
  });
});

describe('/GET products', () => {
  it('it should GET all products', done => {
    chai
      .request(server)
      .get('/products')
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('/POST login', () => {
  it('it should POST user login', done => {
    let user = {
      username: 'yellowleopard753',
      password: 'jonjon'
    }
    chai
      .request(server)
      .post('/login')
      .send(user)
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
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
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
        done();
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
        done();
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
        done();
        });
    });
  });
});
