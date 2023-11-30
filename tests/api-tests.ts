/**
 * Entry point for tests.
 */

// Type imports
import { TestSunglasses } from "./sunglasses-tests";
import { TestUser } from "./user-tests";

// Module imports
import chai = require("chai");
import chaiHttp = require("chai-http");
const server = require("../app/server.ts");

// Test imports
const testSunglasses: TestSunglasses = require("./sunglasses-tests");
const testUser: TestUser = require("./user-tests");

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

// Test sunglasses routes

testSunglasses();

// Test user routes

testUser();
