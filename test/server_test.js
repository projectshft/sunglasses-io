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
      .get("/api/me/cart?accessToken=abc123")
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
  it("should return 401 code if requesting user isn't logged in", done => {
    chai
      .request(server)
      .get("/api/me/cart?accessToken=abc124")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });
});

//POST cart
describe("/POST cart", () => {
  it("should return status 200, and item added to cart, if user is authenticated", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=abc123&productId=1")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ id: "1", name: "Superglasses", price: 150, quantity: 1 });
        done();
    });
  });
  it("should return 401 code if requesting user isn't logged in", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=abc124&productId=1")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });
  it("should return 404 code if product not found", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=abc123&productId=12")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        done();
      });
  });
});

//DELETE cart
describe("/DELETE cart", () => {
  it("should return status 200 if user is authenticated, and product was removed", done => {
    chai
      .request(server)
      //First add an item to the cart with productId = 1
      .post("/api/me/cart?accessToken=abc123&productId=1")
      .end((err, res) => {
        chai
          .request(server)
          .delete("/api/me/cart/1?accessToken=abc123")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            done();
          })
      });
  });
  it("should return status 401 for unauthorized access", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=abc123&productId=1")
      .end((err, res) => {
        chai
          .request(server)
          .delete("/api/me/cart/1?accessToken=abc124")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(401);
            done();
          })
      });
  });
  it("should return status 404 for product not found in cart", done => {
    chai
      .request(server)
      .post("/api/me/cart?accessToken=abc123&productId=1")
      .end((err, res) => {
        chai
          .request(server)
          .delete("/api/me/cart/2?accessToken=abc123")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(404);
            done();
          })
      });
  });
});

//POST update quantity in cart
describe("/POST cart, {productId}", () => {
  it("should return status 200, and item quantity updated in cart, if user is authenticated", done => {
    chai
      .request(server)
      //First add an item to the cart with productId = 1
      .post("/api/me/cart?accessToken=abc123&productId=1")
      .end((err, res) => {
        chai
          .request(server)
          .post("/api/me/cart/1?accessToken=abc123&amount=5")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            expect(response.body).to.deep.equal({ id: "1", name: "Superglasses", price: 150, quantity: 5 });
            done();
          })
      });
  });
});