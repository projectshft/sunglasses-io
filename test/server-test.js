const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

// Tests for GET /api/brands endpoint

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});

// Tests for GET /api/products endpoint

describe("/GET products", () => {
  it.only("should GET all products on empty query", done => {
    chai
      .request(server)
      .get("/api/products?query=")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(11);
        done();
      });
  });
  it.only("should GET all matching products based on user query", done => {
    chai
      .request(server)
      .get("/api/products?query=sweetest")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only("should give 404 error on query with no matches", done => {
    chai
      .request(server)
      .get("/api/products?query=holybatman")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(404);
        done();
      });
  });
});

// Tests for GET /api/brands/:id/products endpoint

describe("/GET products by brand ID", () => {
  it.only("should GET all products for a brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(3);
        done();
      });
  });
  it.only("should GET 404 error for no matches to brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/6/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(404);
        done();
      });
  });
});

// Tests for POST /api/login endpoint

let token = null;

describe("/POST login a user", () => {
  it.only("should login the user", done => {
    chai
      .request(server)
      .post("/api/login")
      .set({username: 'greenlion235', password: 'waters'})
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.lengthOf(16);
        chai.expect(response.body).to.be.a("string");
        token = response.body;
        done();
      });
  });
  it.only("should return a 401 error if an invalid username or password is sent", done => {
    chai
      .request(server)
      .post("/api/login")
      .set({username: 'wronguser', password: 'wrongpass'})
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(401);
        done();
      });
  });
});

// Tests for /api/me/cart GET endpoint

describe("/GET a users cart", () => {
  it.only("get the contents of a users cart", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");        
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.be.lengthOf(2);
        done();
      });
  });
});

// Tests for /api/me/cart PUT endpoint

describe("/PUT a users cart", () => {
  it.only("updates the quantities of a users cart", done => {
    chai
      .request(server)
      .put("/api/me/cart")
      .set("token", token)
      .set('updatedQuantities', '20, 25')
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");        
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.be.lengthOf(2);
        chai.expect(response.body[0].quantity).to.eql(20);
        chai.expect(response.body[1].quantity).to.eql(25);
        done();
      });
  });
});

// Tests for /api/me/cart/:productId DELETE endpoint

describe("/DELETE a product", () => {
  it.only("deletes a product from a users cart", done => {
    chai
      .request(server)
      .delete("/api/me/cart/1")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");        
        chai.expect(response.body).to.be.a("array");
        chai.expect(response.body).to.be.lengthOf(1);
        done();
      });
  });
  it.only("receives 400 error if product Id is invalid", done => {
    chai
      .request(server)
      .post("/api/me/cart/18")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(400);
        chai.expect("Content-Type", "application/json");
        done();
      });
  });
});

// Tests for /api/me/cart/:productId POST endpoint

describe("/POST a product", () => {
  it.only("adds a new product to a users cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/3")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");        
        chai.expect(response.body).to.be.a("array");
        chai.expect(response.body).to.be.lengthOf(3);
        done();
      });
  });
  it.only("updates quantity of product in cart if already in cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/3")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");        
        chai.expect(response.body).to.be.a("array");
        chai.expect(response.body).to.be.lengthOf(3);
        chai.expect(response.body[2].quantity).to.eql(2);
        done();
      });
  });
  it.only("receives 400 error if product Id is invalid", done => {
    chai
      .request(server)
      .post("/api/me/cart/15")
      .set('token', token)
      .end((error, response) => {
        chai.assert.isNull(error);
        chai.expect(response).to.have.status(400);
        chai.expect("Content-Type", "application/json");
        done();
      });
  });
});