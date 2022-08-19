let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("GET /api/products", () => {
  it("should GET all products", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(11);
        done();
      });
  });
});

describe("GET /api/brands", () => {
  it("should GET all brands", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(5);
        done();
      });
  });
});

describe("GET /api/brands/:id/products", () => {
  it("should GET all products of given brand", (done) => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(3);
        done();
      });
  });
});

describe("POST /api/login", () => {
  it("should not POST user credentials if username/password combo incorrect", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ "username": "greenlion235", "password": "waters123" })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it("should not POST user credentials if either username or password is missing", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ "username": "greenlion235" })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  it("should POST user credentials", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ "username": "greenlion235", "password": "waters" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.should.have.lengthOf(16);
        done();
      });
  });
});

describe("GET /api/me/cart", () => {
  it("should not GET user cart if user not logged in", (done) => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set("username", "lazywolf342")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it("should GET all products in user cart", (done) => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set("username", "greenlion235")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });
});

describe("POST /api/me/cart", () => {
  it("should not POST a product if user not logged in", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("username", "lazywolf342")
      .query({ "productId": 24 })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it("should POST a new product to user's empty cart", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("username", "greenlion235")
      .query({ "productId": 1 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(1)
        done();
      });
  });
  it("should POST an additional product to the user's cart", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("username", "greenlion235")
      .query({ "productId": 8 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(2)
        done();
      });
  });
  it("should POST a product that already exists in the user's cart by increasing its quantity", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("username", "greenlion235")
      .query({ "productId": 1 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(2)
        done();
      });
  });
  it("should not POST a product if not found in data", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("username", "greenlion235")
      .query({ "productId": 24 })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("PUT /api/me/cart/:productId", () => {
  it("should not UPDATE a product if user not logged in", (done) => {
    chai
      .request(server)
      .put("/api/me/cart/11")
      .set("username", "lazywolf342")
      .query({ "qty": 7 })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it("should UPDATE product in user's cart with given quantity", (done) => {
    chai
      .request(server)
      .put("/api/me/cart/8")
      .set("username", "greenlion235")
      .query({ "qty": 99 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(2)
        done();
      });
  });
  it("should not UPDATE a product not found in user's cart", (done) => {
    chai
      .request(server)
      .put("/api/me/cart/11")
      .set("username", "greenlion235")
      .query({ "qty": 7 })
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("DELETE /api/me/cart/:productId", () => {
  it("should not REMOVE a product if user not logged in", (done) => {
    chai
      .request(server)
      .delete("/api/me/cart/5")
      .set("username", "lazywolf342")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it("should REMOVE product from user's cart", (done) => {
    chai
      .request(server)
      .delete("/api/me/cart/1")
      .set("username", "greenlion235")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(1)
        done();
      });
  });
  it("should not REMOVE a product not found in user's cart", (done) => {
    chai
      .request(server)
      .delete("/api/me/cart/5")
      .set("username", "greenlion235")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});