// let Products = "";

// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server = require("../server");

// let should = chai.should();

// chai.use(chaiHttp);

// describe("Products", () => {
//   describe("/GET products", () => {
//     it("it should GET all of the products", done => {
//       chai.request(server)
//       .get("/brands")
//       .end((err, res) => {
//         res.should.have.status(200)
//         res.body.should.be.an("array");
//         res.body.length.should.be.eql(0);
//         err.should.have.status(400);
//         done();
//       })
//     })
//   })
// })