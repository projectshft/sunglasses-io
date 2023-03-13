// let Login = "";

// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server = require("../server");

// let should = chai.should();

// chai.use(chaiHttp);

// describe("Login", () => {
//   describe("/POST login data", () => {
//     it("post all required login data", done => {
//       let login = {
//         username: "test",
//         password: "test",
//         salt: "test",
//         md5: "test",
//         sha1: "test",
//         sha256: "test"
//       }
//       chai.request(server)
//       .post("/login")
//       .send(login.username, login.password)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.have.cookie("userAuth")
//         res.should.have.status(201)
//         res.body.should.be.an("object");
//         res.body.should.have(username)
//         res.body.should.have(password)
//         res.body.should.have(salt)
//         res.body.should.have(md5)
//         res.body.should.have(sha1)
//         res.body.should.have(sha256)
//         err.should.have.status(400)
//         err.should.have.status(401)
//         done();
//       })
//     })
//   })
// })