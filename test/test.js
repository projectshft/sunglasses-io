let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect, assert } = require("chai");
let should = chai.should();
chai.use(chaiHttp);

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
    .request(server)
    .get("/brands")
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      res.should.have.status(200);
      expect("Content-Type", "application/json");
      res.body.should.be.an("array");
      done();
    })
  })
});

