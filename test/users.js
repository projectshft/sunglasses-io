let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Users", () => {
  describe("/POST login", () => {
    it("it should return a 400 status if the username and/or password are missing from the request", (done) => {

      chai
        .request(server)
        .post("/api/login")
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("it should return a 401 status if the given username and/or password are incorrect", (done) => {
      // test with incorrect login credentials
      let userCredentials = {
        "username": "hello",
        "password": "world",
      }

      chai
        .request(server)
        .post("/api/login")
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should POST the username and password and return an access token", (done) => {
      // test with login credentials for user natalia ramos
      let userCredentials = {
        "username": "greenlion235",
        "password": "waters",
      }

      chai
        .request(server)
        .post("/api/login")
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          res.body.length.should.be.eql(16);
          done();
        });
    });
  });
});