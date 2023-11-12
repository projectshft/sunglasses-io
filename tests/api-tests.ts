import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
const fs = require("fs");
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
    before(function () {
      fs.writeFile(
        "initial-data/brands.json",
        '[]',
        (err: any) => {
          if (err) throw err;
        }
      );
    });

    afterEach(function (done) {
      const brands = [
        { id: "1", name: "Oakley" },
        { id: "2", name: "Ray Ban" },
        { id: "3", name: "Levi's" },
        { id: "4", name: "DKNY" },
        { id: "5", name: "Burberry" },
      ];

      fs.writeFile(
        "initial-data/brands.json",
        JSON.stringify(brands),
        (err: any) => {
          if (err) throw err;
        }
      );
      
      server.close()
      done();
    });

    it("should return a 404 error if no brands are found", function (done) {
      chai
        .request(server)
        .get("/api/sunglasses/brands")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          console.log(res.body);
          res.should.have.status(404);
          done();
        });
    });

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
