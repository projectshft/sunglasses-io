const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

// Tests for /api/brands endpoint

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
        //chai.expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});

// Tests for /api/products endpoint

describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((error, response) => {
        chai.assert.exists(response.body);
        chai.expect(response).to.have.status(200);
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("array");
        chai.expect(response.body).to.have.lengthOf(11);
        done();
      });
  });
});

// Tests for /api/brands/:id/products endpoint

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
        chai.expect("Content-Type", "application/json");
        chai.expect(response.body).to.be.an("object");
        done();
      });
  });
});

// Tests for /api/login endpoint

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
});

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
});