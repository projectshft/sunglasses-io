const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET ALL BRANDS
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

describe("/GET products by brand", () => {
  it.only("should GET all products in a brand", done => {
    chai
      .request(server)
      .get("/api/brands/1/products") //testing for brand id 1
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        done();
        });
    });
    it.only("fails as expected with unknown id", done => {
        chai
          .request(server)
          //property doesn't exist
          .get("/api/brands/7/products") //7 is an unidentified id
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
  });
