const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./app/server');

let should = chai.should();
chai.use(chaiHttp);

describe('Sunglasses', function() {
  describe('/GET search in all sunglasses',function() {
    it('should return all sunglasses by default', function(done) {
      chai.request(server)
      .get('/sunglasses')
      .end(function(err, res) {
        should.exist(res)
        res.should.have.status(200)       
        res.body.should.be.an('array')
        done()
      })
    })
  })
})

