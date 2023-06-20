const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server.js");
const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

describe("Login", () => {
  describe("/POST login info", () => {
    it("posts all login info", (done) => {
      let login_info = {
        "username": "yellowleopard753",
        "password": "jonjon"
      }
      chai
      .request(server)
      .post('/login')
      .send(login_info)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body[0].username).to.equal("yellowleopard753");
        expect(res.body[0].lastUpdated).to.be.a("string");
        expect(res.body[0].token).to.have.lengthOf(16);
          done();
      })
    })
  })
})