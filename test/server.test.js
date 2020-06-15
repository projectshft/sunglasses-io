const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));


// Brands =========================================

// GET Brands
describe("/GET brands", () => {
    it.only("should GET all brands", done => {
      chai
        .request(server)
        .get("/v1/brands")
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(res.body).to.be.an("array");
          expect(res.body).to.have.lengthOf(5);
          done();
        });
    });
    //If nothing is in the search, return all brands
    it.only("returns all brands if query is missing", done => {
        chai
          .request(server)
          .get("/v1/brands?query=")
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(5);
            done();
          });
      });
      
      it.only("should limit results to those with a query string", done => {
        chai
          .request(server)
          .get("/v1/brands?query=Oakley")
          .end((err, res) => {
            assert.isNotNull(res.body);
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(1);
            done();
          });
      });

      it("fails as expected, unrecognized property", done => {
        chai
          .request(server)
          .get("/v1/brands?sort=sdfv")
          .end((err, res) => {
            expect(err).to.not.be.null;
            expect(res).to.have.status(404);
            done();
          });
      });
});
// GET /api/brands/:id/products



// Products  =======================================
// GET /api/products


// Login ===========================================

// POST /api/login



// Cart ============================================


// GET /api/me/cart
// POST /api/me/cart

// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId