let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let should = chai.should();
let expect = chai.expect;
let chaiSubset = require('chai-subset');

chai.use(chaiHttp);
chai.use(chaiSubset);

describe("Sunglasses", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/v1/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.have.property("id");
          res.body[0].should.have.property("name");
          done();
        })
    })
  });

  describe("/GET/:id/products products", () => {
    it("it should GET all products by the given brand id", (done) => {
      let brand = {
        "id": "2",
        "name": "Ray Ban"
      }
      chai
        .request(server)
        .get("/v1/brands/" + brand.id + "/products")
        .send(brand)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body).to.containSubset([{ "brandId": brand.id }]);
          done();
        })
    })
  });

  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/v1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        })
    })
  });

  describe("/POST user login", () => {
    it("it should POST the user logging in", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          done();
        })
    });
  });

  describe("/GET user's cart", () => {
    it("it should GET all the products in the cart", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          chai
            .request(server)
            .get("/v1/me/cart")
            .set("currentAccessToken", res.body.token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              done();
            })
        })
    });
  });

  describe("/POST to user's cart", () => {
    it("it should POST a product to the cart", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          chai
            .request(server)
            .post("/v1/me/cart")
            .set("currentAccessToken", res.body.token)
            .send({
              "productId": 2,
              "quantity": 3
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body[0].should.have.property("id").eql('2')
              done();
            })
        })
    })
  });

  describe("/POST product", () => {
    it("it should UPDATE the product quantity", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          let product = {
            "id": "2",
          }
          chai
            .request(server)
            .post("/v1/me/cart/" + product.id)
            .set("currentAccessToken", res.body.token)
            .send({
              "quantity": 1
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body[0].should.have.property("quantity").eql(1);
              res.body[0].should.have.property("id").eql(product.id);
              res.body[0].should.have.property("quantity").above(0);
              done();
            })
        })
    });
  })

  describe("/DELETE product", () => {
    it("it should DELETE the product with the ID", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          let product = {
            "id": "2",
          }
          chai
            .request(server)
            .delete("/v1/me/cart/" + product.id)
            .set("currentAccessToken", res.body.token)
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("object");
              res.body.should.not.have.property("id").eql(product.id);
              done();
            })
        })
    });
  });
});

