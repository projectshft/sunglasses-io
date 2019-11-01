const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const assert = chai.assert;
const expect = chai.expect;

let should = chai.should();

chai.use(chaiHTTP);

// build test, build server(endpoint) pass test against server, after pass add to swagger doc.
// GET / api / brands /: id / products
// GET / api / products
// POST / api / login
// GET / api / me / cartmoca
// POST / api / me / cart
// DELETE / api / me / cart /: productId
// POST / api / me / cart /: productId


// GET / api / brands

describe('GET /api/brands', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get('/api/brands')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        console.log(res.body);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

// describe('/GET brands', () => {
//   it('it should GET all the brands', done => {
//     chai
//       .request(server)
//       .get('/api/brands')
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         // res.should.have.status(200);
//         // res.body.should.be.an('array');
//         expect(res.body).to.be.an('array');
//         expect(res.body).to.have.lengthOf(5);
//         // res.body.length.should.be.eql(5);
//         done();
//       });
//   });
// });
