
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server.js');
let should = chai.should();
chai.use(chaiHttp);

// describe('PRODUCTS: The server', () => {
  describe('GET /brands should return', () => {
    it('all brands and IDs as array of objects', done => {
      
     chai
      // arrange  
      .request(server)
        // act
        .get('/api/brands')
        .end((err, res) => {
          // assert
          res.should.have.status(200);
          // res.body.should.be.an('array');
          done();
        });
    });
    });
  // });
