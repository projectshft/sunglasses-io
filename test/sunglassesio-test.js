const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

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

describe("/POST login", () => {
  it("should be successful if the credentials are valid", done => {
    chai
      .request(server)
      .post("/api/login")
      .set({username: "yellowleopard753", password: "jonjon"})
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.a("string");
        expect(res.body).to.have.lengthOf(11);
        done();
      });
  });
  it("should fail if username/password does not exist in data", done => {
    chai
      .request(server)
      .post("/api/login")
      .set({username: "emilyfreeman", password: "fake"})
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it("should fail if username/password is empty", done => {
    chai
      .request(server)
      .post("/api/login")
      .set({username: "emilyfreeman", password: ""})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe("/GET items in cart", () => {
  it("should return all items in cart if a user is logged in", done => {
    chai
      .request(server)
      .get("/api/me/cart?accessToken=1234")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it("should return error if user is not logged in", done => {
    chai
      .request(server)
      .get("/api/me/cart?accessToken=")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("/POST items to cart", () => {
  it("should add items to the cart if user is logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=1234")
      .send({product: "test"})
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
  it("should return error if user is not logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("/DELETE items from cart", () => {
  it("should delete an item from cart if user is logged in", done => {
    chai
      .request(server)
      .delete("/api/me/cart/47?accessToken=1234")
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
  it("should return error if user is not logged in", done => {
    chai
      .request(server)
      .delete("/api/me/cart/4?accessToken=")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
    });
  });
  it("should return error if productId is not in cart", done => {
    chai
      .request(server)
      .delete("/api/me/cart/98?accessToken=1234")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
    });
  });
});

describe("/POST quantity to cart", () => {
  it("should change quantity of item in cart if user is logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart/47?accessToken=1234")
      .send({amount: "4"})
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
  it("should return error if user is not logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart/4?accessToken=")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
    });
  });
  it("should return error if productId is not in cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/98?accessToken=1234")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
    });
  });
})


