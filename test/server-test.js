let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server')
let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
    describe('/GET brands', () => {
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
  
    describe('/GET brands/:id/products', () => {
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
    describe('/GET products', () => {
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
  describe('/POST login', () => {
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