const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

let should = chai.should();

chai.use(chaiHTTP);

describe('/GET brands', () => {
  it('should GET all brands', done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect('Content-Type', 'application/json');
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
  it("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/brands?query=DKNY")
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
  it("returns all goals if query is missing", done => {
    chai
      .request(server)
      .get("/api/brands?query=")
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
  // it("should return error if query does not match data", done => {
  //   chai
  //     .request(server)
  //     .get("/api/brands?query=sfdksl")
  //     .end((err, res) => {
  //       expect(res).to.have.status(404);;
  //       done();
  //     })
  // })
});

describe("/GET products of a brand", () => {
  it("should GET the products of a brand", done => {
    chai
      .request(server)
      .get("/api/brands/2/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(2);
        done();
      });
  });
  it("should return error if id does not exist", done => {
    chai
      .request(server)
      .get("/api/brands/12/products")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/GET products", () => {
  it("should GET all available products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
  it("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=Brown")
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
  it("returns all goals if query is missing", done => {
    chai
      .request(server)
      .get("/api/products?query=")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
});

// describe("/POST login", () => {
//   it("")
// })

