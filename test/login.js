
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

let should = chai.should();

chai.use(chaiHttp);



describe("Login", () => {
  describe("/POST login data", () => {
    it("post all required login data", done => {
      //post users data tried other passwords
      let user = {
        "username": "lazywolf342",
        "password": "tucker"
      }
      chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      })
    })
  })
})

