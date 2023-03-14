// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server = require("../app/server");

// let should = chai.should();

// let removeAll = function () {
//   cart = [];
// }

// chai.use(chaiHttp);

// describe('Cart', () => {
//   beforeEach(() => {
//     removeAll();
//   })

//   describe('Me/cart', () => {
//     it("it should GET all of the items in users cart", done => {
//       chai
//       .request(server)
//       .get('/me/cart')
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.an('array');
//         res.body.length.should.be.eql(0);
//         done();
//       });
//     });
//   });
// })