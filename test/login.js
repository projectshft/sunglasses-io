
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");
let expect = chai.expect;

let should = chai.should();

chai.use(chaiHttp);



describe("Login", () => {
  describe("/POST login data", () => {
    it("post all required login data", done => {
      //post users data & tried other passwords
      let login_details = {
        "username": "lazywolf342",
        "password": "tucker"
      }
      chai
      .request(server)
      .post('/login')
      .send(login_details)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body[0].username).to.equal('lazywolf342');
        expect(res.body[0].lastUpdated).to.be.a('string');
        expect(res.body[0].token).to.have.lengthOf(16);
        const token = res.body[0].token;
        done();
      })
    })
  })
})



