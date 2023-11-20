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

// Tests for login-methods:

// updateAccessToken
// "should update the date string held by accessToken.lastUpdated

// login function
// should assign an old accessToken if one already exists and is not expired
// should assign a new accessToken if old one does not exist or is expired
