import chai = require("chai");
import { expect } from "chai";
//import { should } from "chai";
import chaiHttp = require("chai-http");
const server = require("../app/server.ts");

// Define should
const should = chai.should();

// Allow chai to use chaiHttp middleware
chai.use(chaiHttp);

describe("/", function () {
  it("should start the server", function (done) {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        if (err) {
          done(err);
        }
        //expect(res.status).to.equal(200);
        res.should.have.status(200);
        done();
      });
  });
});
