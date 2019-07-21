const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

describe("GET api/brands", () => {
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
describe("GET api/brands/:id/products", () => {
  it("should get the products associated with the Brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3);
        expect(res.body[0].name).to.eq("Superglasses");
        done();
      });
  });
  it("should return status 400 if no brands are found", done => {
    chai
      .request(server)
      .get("/api/brands/100/products")
      .end((err, res) => {
        assert.isNotNull(res.error);
        expect(res).to.have.status(400);
        done();
      });
  });
});
describe("GET api/products", () => {
  it("should get all the products", done => {
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
        expect(res.body[0].name).to.eq("Superglasses");
        done();
      });
  });
});
describe("POST api/login", () => {
  it("should return 200 on a valid login", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({ email: "susanna.richards@example.com", password: "jonjon" })
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(res.body).to.have.lengthOf(16);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it("should return 401 on incorrect username or password", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({ email: "fake.name@example.com", password: "jonjon" })
      .end((err, res) => {
        assert.isNotNull(res.error);
        expect(res).to.have.status(401);
        done();
      });
  });
  it("should return 400 on an incorrectly formatted request", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({ test: "susanna.richards@example.com", test2: "jonjon" })
      .end((err, res) => {
        assert.isNotNull(res.error);
        expect(res).to.have.status(400);
        done();
      });
  });
});
describe("GET api/me/cart", () => {
  it("should return the user's cart on a valid provided token", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .send({ token: 1234567890123456})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      })
  })
  it("should return 401 with an invalid token", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .send({ token: 'test'})
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      })
  })
  it("should return 400 with an incorrectly formatted request", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .send({ test: 1234567890123456})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      })
  })
})
