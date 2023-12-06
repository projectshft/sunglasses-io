let chai = require('chai');
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("GET /api/brands", () => {
    it("it should return all brands of sunglasses", (done) => {
      chai
        .request(server)
        .get('brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body.should.be.eql(5);
          done();
        })
    })
  })
})