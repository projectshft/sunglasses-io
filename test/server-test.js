const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});