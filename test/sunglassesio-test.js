const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

describe('/GET brands', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      })
  })
})