const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require('../app/server.js');

const should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET, brands', () => {
    it ('should GET all brands', (done) => {
      chai.request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      })
    })
  })
})