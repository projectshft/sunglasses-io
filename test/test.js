let { expect } = require('chai');
let http = require('http');
let chaiHttp = require('chai-http');
let chai = require('chai');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);

// also require functions from ./sunglasses-server.js to test
// Testing phases: Arrange, Act, Assert!
// Testing modes: positive - what must occur / negative - what must not occur



  describe('/api/brands', () => {
    it('should return an array', () => {
      chai 
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          if(err) throw err;
          res.should.have.status(200);
          res.body.should.be.an('array');
        })
    });
  });

  describe('/api/brands/:id/products', () => {
    it('should return an array of products chosen by brand', () => {
      let id = 'gucci';
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          if(err) throw err;
          res.should.have.status(200);
          res.body.should.be.an('array');
        })
    });
  });

  describe('/api/products', () => {
    it('should return an array', () => {
      chai 
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          if(err) throw err;
          res.should.have.status(200);
          res.body.should.be.an('array');
          
        })
    });
  });

  describe('/api/login', () => {
    it('should return an access token string', (done) => {
      chai
      .request(server)
      .post('/api/login')
      .send(username = 'BorisJ')
      .send(password = 'userPass123')
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(200);
        res.body.should.be.a('string');
        done();
      })
    })
  })