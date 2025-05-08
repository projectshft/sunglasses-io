const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server");

const should = chai.should();
chai.use(chaiHttp);

describe("Brands", () => {
  it("GET /api/brands - should get all brands", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("brands");
        res.body.brands.should.be.an("array");
        done();
      });
  });
});

describe("Products by Brand ID", () => {
  it("GET /api/brands/:brandId/products - should get products by brand ID", (done) => {
    const brandId = "1";
    chai
      .request(server)
      .get(`/api/brands/${brandId}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("products");
        res.body.products.should.be.a("array");
        done();
      });
  });
});

describe("GET All Products", () => {
  it("GET /api/products - should get all products", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("products");
        res.body.products.should.be.an("array");
        done();
      });
  });
});

describe("Login", () => {
  it("POST /api/login - should return a token for valid login credentials", (done) => {
    const credentials = {
      email: "susanna.richards@example.com",
      password: "jonjon",
    };

    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");
        done();
      });
  });

  it("POST /api/login - should return 401 for invalid credentials", (done) => {
    const invalidCredentials = {
      email: "invalid.email@example.com",
      password: "fadsfasd",
    };

    chai
      .request(server)
      .post("/api/login")
      .send(invalidCredentials)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property("message").eql("Invalid credentials");
        done();
      });
  });
});

describe("Cart", () => {
  let token;

  before((done) => {
    const credentials = {
      email: "susanna.richards@example.com",
      password: "jonjon",
    };

    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it("GET /api/me/cart - should return the user's cart", (done) => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });

  it("GET /api/me/cart - should return 401 for unauthorized access", (done) => {
    chai
      .request(server)
      .get("/api/me/cart")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});

describe("POST /api/me/cart", () => {
  let token;

  before((done) => {
    const credentials = {
      email: "susanna.richards@example.com",
      password: "jonjon",
    };

    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it("POST /api/me/cart - should add a product to the cart", (done) => {
    const productToAdd = {
      productId: 111,
    };

    chai
      .request(server)
      .post("/api/me/cart")
      .set("Authorization", `Bearer ${token}`)
      .send(productToAdd)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("added to cart");
        res.body.cart.should.be.an("array");
        done();
      });
  });

  it("POST /api/me/cart - should return 400 for missing product ID", (done) => {
    chai
      .request(server)
      .post("/api/me/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("product ID is required");
        done();
      });
  });
});

describe("DELETE /api/me/cart/:productId", () => {
  let token;

  before((done) => {
    const credentials = {
      email: "susanna.richards@example.com",
      password: "jonjon",
    };

    chai
      .request(server)
      .post("/api/login")
      .send(credentials)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it("DELETE /api/me/cart/:productId - should remove a product from the cart", (done) => {
    const productIdToRemove = 111;

    chai
      .request(server)
      .delete(`/api/me/cart/${productIdToRemove}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("removed from cart");
        res.body.cart.should.be.an("array");
        done();
      });
  });

  it("DELETE /api/me/cart/:productId - should return 404 for product not found", (done) => {
    const invalidProductId = 84902367;

    chai
      .request(server)
      .delete(`/api/me/cart/${invalidProductId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("message").eql("product not found");
        done();
      });
  });
});
