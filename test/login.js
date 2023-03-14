
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);



describe("Login", () => {
  describe("/POST login data", () => {
    it("post all required login data", done => {
      let user = users[0]
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

