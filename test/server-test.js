let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();
let { expect } = chai;
// mocha server-test.js --watch

chai.use(chaiHttp);

describe("When a brands request is reveived", () => {
  describe("the response", () => {
    it("should return the current list of brands", done => {
      chai
        .request(server)
        .get('/v1/brands')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
        })
    })
  })
})