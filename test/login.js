let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('login', () => {

  // Test for a successful login
  describe('/POST login', () => {
    it('it should successfully return a success message when user logs in', done => {
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.token.should.be.a('string');
          done();
        });
    });
  });

  // Test for an invalid login - user not found
  describe('/POST login', () => {
    it('it should return an error message with status code 401', done => {
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'myCoolBeans@ok.com',
          'password': 'okBeans',
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Invalid username or password');
          done();
        })
    })
  });

  // Test for an invalid login - Empty fields
  describe('/POST login', () => {
    it('it should return an error message with status code 401', done => {
      chai
        .request(server)
        .post('/login')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.message.should.be.eql('Failed login, empty fields');
          done();
        })
    })
  });
});