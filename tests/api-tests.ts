import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
const server = require("../app/server.ts");

// Define should
chai.should();

// Allow chai to use chaiHttp middleware
chai.use(chaiHttp);

// Test server starts up
describe("/api/", function () {
  it("should start the server", function (done) {
    chai
      .request(server)
      .get("/api/")
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.should.have.status(200);
        res.body.should.equal("Server is up and running");
        done();
      });
  });
});

// Test sunglasses route
describe("Brands", function () {
  describe("GET /api/sunglasses/brands", function () {
    it("should return an array of brands", function (done) {
      const brands = [
        { id: "1", name: "Oakley" },
        { id: "2", name: "Ray Ban" },
        { id: "3", name: "Levi's" },
        { id: "4", name: "DKNY" },
        { id: "5", name: "Burberry" },
      ];

      chai
        .request(server)
        .get("/api/sunglasses/brands")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.equal(5);
          res.body.should.deep.equal(brands);
          done();
        });
    });
  });
});
