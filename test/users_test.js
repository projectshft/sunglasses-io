// var expect = require('chai').expect;
var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const products = require('../initial-data/products.json')

should = chai.should();
chai.use(chaiHttp)  

// User
describe('Users', () => {
  describe('Get user info', () => {
    it('Should return user info', done => {
      chai 
        .request(server)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(3);
          res.body[0].should.have.keys('gender', 'cart', 'name', 'location', 'email', 'login', 'dob', 'registered', 'phone', 'cell', 'picture', 'nat');
          done();
        })
      })
    })
  })
