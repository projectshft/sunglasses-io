var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const brands = require('../initial-data/brands.json')

should = chai.should();
chai.use(chaiHttp)  

// All Brands
describe('Brands', () => {
  describe('Get brands', () => {
    it('Should return all brands', done => {
      chai 
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          res.body[0].should.have.keys('id', 'name');
          done();
        })
      })
    })
  })

