let chai = require("chai");
let chaiHttp = require("chai-http");

let server = require("../app/server");
let should = chai.should();
chai.use(chaiHttp);

// let brands = require("./../initial-data/brands.json")
// let products = require("./../initial-data/products.json")
// let users = requre("./../initial-data/users.json")

// what do we want website to do?
// creating a test that will exercise an endpoint, then let it fail, then implement the endpoint to make the test pass.

// start up test with
// mocha sunglasses-test.js --watch

// https://www.chaijs.com/api/bdd/

// endpoints are:

// GET /api/brands
// describe("WHAT   GOES   HERE", () => {
//   describe("/GET brands", () => {
//     it("it should GET all the brands", (done) => {
//       chai
//         .request(server)
//         .get("/brands")
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.an("array");
//           res.body.length.should.be.eql(0);
//           done();
//         });
//     });
//   });
// });

// GET /api/brands/:id/products
// GET /api/products
// POST /api/login - use deep here
// GET /api/me/cart
// POST /api/me/cart - use deep here
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId - use deep here
