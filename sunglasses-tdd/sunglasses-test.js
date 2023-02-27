let chai = require("chai");
let {expect, assert} = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

let brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
let products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

describe("Brands", () => {
  // Test the GET /api/brands route
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai.request(server)
      .get("/api/brands")
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .end((err, res) => {
        res.should.have.status(200);
        expect(err).to.be.null;
        res.should.be.json;
        res.body.should.be.an("array");
        res.body.should.be.eql(brands);
        done();
      });
    });
  });

  // Test the GET /api/brands/:id/products route
  describe("/GET products from a selected brand using categoryId", () => {
    it("it should GET all the products in a certain brand ", (done) => {
      chai.request(server)
      .get(`/api/brands/1/products`)
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .end((err, res) => {
        res.should.have.status(200);
        expect(err).to.be.null;
        res.body.should.be.an("array");
        done();
      });
    });
  });
});

describe("Products", () => {
  // Test the GET /api/products route
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai.request(server)
      .get("/api/products")
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .end((err, res) => {
        res.should.have.status(200);
        expect(err).to.be.null;
        res.should.be.json;
        res.body.should.be.an("array");
        res.body.should.be.eql(products);
        done();
      });
    });
  });
});

describe("Login", () => {
  // Test the POST /api/login route
  describe("/POST login", () => {
    it("it should GET all the products", (done) => {
      chai.request(server)
      .post("/api/login")
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send({"username": "yellowleopard753", "password": "jonjon"})
      .end((err, res) => {
        accessToken = 'accessToken=' + res.body;
        res.should.have.status(200);
        expect(err).to.be.null;
        res.should.be.json;
        res.body.should.be.an("string");
        done();
      });
    });
  });
});

describe("User", () => {
  // Test the GET /api/me/cart route
  describe("/GET Users Cart", () => {
    it("it should GET all the products ina  users cart", (done) => {
      chai.request(server)
      .get(`/api/me/cart?${accessToken}`)
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send({"username": "yellowleopard753", "password": "jonjon"})
      .end((err, res) => {
        res.should.have.status(200);
        expect(err).to.be.null;
        res.should.be.json;
        res.body.should.be.an("array");
        done();
      });
    });
  });

  // Test the POST /api/me/cart route
  describe("/POST Users Cart ", () => {
    it("it should allow users to add products to their cart", (done) => {
      chai.request(server)
      .post(`/api/me/cart?${accessToken}`)
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send({"username": "yellowleopard753", "password": "jonjon"})
      .end((err, res) => {
        res.should.have.status(200);
        expect(err).to.be.null;
        res.should.be.json;
        res.body.should.be.an("array");
        done();
      });
    });
  });

  // Test the DELETE /api/me/cart/:productId route
  describe("/DELETE Item In Users Cart ", () => {
    it("it should delete product in users cart", (done) => {
      chai.request(server)
      .delete(`/api/me/cart/1?${accessToken}`)
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send({"username": "yellowleopard753", "password": "jonjon"})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        done();
      });
    });
  });

  // Test the POST /api/me/cart/:productId route
  describe("/POST Item In Users Cart ", () => {
    it("it change the quantity of a product in a users cart", (done) => {
      chai.request(server)
      .post(`/api/me/cart/1?${accessToken}`)
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send({"username": "yellowleopard753", "password": "jonjon"})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        done();
      });
    });
  });
});