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
    it('should return an array', (done) => {
      chai 
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('application/json');
          done();
        })
    });
  });
