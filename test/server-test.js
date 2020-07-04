// let Brand = require('../app/models/brand');

const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../server");
const expect = chai.expect;
const assert = chai.assert;
let should = chai.should();

chai.use(chaiHTTP);
//chai.use(require("chai-sorted"));


// GET ALL BRANDS
describe('/GET brands', () => {
  it('it should GET all the brands', done => {
    chai
      .request(server)
      .get('/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      });
  });
});

