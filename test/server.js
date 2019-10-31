const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET GOALS
describe("/GET test", () => {
  it("fails as expected when unrecognized property", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/")
      .end((err, res) => {
        done();
      });
  });
});
