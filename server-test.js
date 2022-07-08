const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./app/server');

let should = chai.should();
chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET search in all sunglasses', () => {
    it('should return all sunglasses by default', (done) => {
      chai.request(server)
      .get('/sunglasses')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        done()
      })
    })
  })
})