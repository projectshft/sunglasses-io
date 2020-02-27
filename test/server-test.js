const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
let should = chai.should;

chai.use(chaiHTTP);

describe("/GET brands", () => {
    it.only("should GET all brands", done => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
});