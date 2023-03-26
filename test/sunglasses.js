const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

// const expect = chai.expect();
const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET sunglasses', () => {
    it('it should GET all the sunglasses', (done) => {
      chai
        .request(server)
        .get('/sunglasses')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

describe('User', () => {
  describe('/POST user info')
    it('should return the user info as an object and a token when POST correct login info', (done) => {
      const validLogin = {
        username: 'yellowleopard753',
        password: 'jonjon'
      };

      chai
        .request(server)
        .post('/me')
        .send(validLogin)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('cart');
          res.body.should.have.property('accessToken');
          done();
        });
    });

    it('should return an error when provided with th wrong login credentials', (done) => {
      const invalidCredentials = {
        username: 'yellowleopard753',
        password: 'nope'
      };

      chai
        .request(server)
        .post('/me')
        .send(invalidCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
});