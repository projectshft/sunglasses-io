// var expect = require('chai').expect;
var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const products = require('../initial-data/products.json')

should = chai.should();
chai.use(chaiHttp)  

// User login
describe('Checks user login', () => {
  it('Should return access token with valid username and password', 
  done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'yellowleopard', password: 'jonjon'})
      .end((err, res) => { 
        res.should.have.status(200);
        done();         
      });
    });
  });

  it('should display an error message if credentials are invalid', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: '', password: '' })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.message.should.equal('Invalid user');
        console();
      });
    });
