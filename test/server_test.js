const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;
let sinon = require('sinon')

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET BRANDS
describe("/GET brands", () => {
   it("should GET all brands", done => {
     chai
       .request(server)
       .get("/api/brands")
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
 });
describe("/GET products of a brand", () => {
  it("should GET all products limited by brand id", done => {
  chai
    .request(server)
    .get('/api/brands/1/products')
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(3);
      done();
    });
  });
  it("should return 404 error code for invalid brand request", done => {
    chai
      .request(server)
      .get('/api/brands/6/products')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect("Content-Type", "application/json");
        done();
      });
  });
});

//GET PRODUCTS
describe("/GET products", () => {
  it("should GET all products", done => {
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
      .get("/api/products?query=Sugar")
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
  it("returns all products if query is missing", done => {
    chai
      .request(server)
      .get("/api/products?query=")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
});

//POST LOGIN
describe("/POST, the login function", () => {
  it("should return status 200, and a token, if user is authenticated", done => {
    let userCredentials = { username: "susanna.richards@example.com", password: "jonjon" }
    chai
      .request(server)
      .post('/api/login')
      .send(userCredentials)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a("string");
        done();
    });
  })
  it("should return status 400 for incorrectly formatted request", done => {
    let userCredentials = { user: "susanna.richards@example.com", password: "jonjon" }
    chai
      .request(server)
      .post('/api/login')
      .send(userCredentials)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        done();
    });
  })
  it("should return status 401 for invalid username/password", done => {
    let userCredentials = { username: "Jay@example.com", password: "abc123" }
    chai
      .request(server)
      .post('/api/login')
      .send(userCredentials)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
    });
  })
});

//GET CART
describe("/GET cart", () => {
  it("should GET all products in the cart for a logged in user", done => {
    chai
      .request(server)
      .get("/me/api/cart?accessToken=abc123")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(0);
        done();
      });
  });
});