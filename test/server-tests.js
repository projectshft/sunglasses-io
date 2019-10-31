const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

describe("/GET brands", () => {
  it("should GET all brands", done => {
    chai
      .request(server)
      .get("/v1/brands")
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(5);
        response.body.forEach(item => {
          expect(item).to.be.an("object");
          expect(item).to.have.property("id");
          expect(item).to.have.property("name");
          expect(item["id"]).to.be.a("string");
          expect(item["id"]).to.exist;
          expect(item["id"]).to.not.be.empty;
          expect(item["name"]).to.be.a("string");
        });
        done();
      });
  });
});
