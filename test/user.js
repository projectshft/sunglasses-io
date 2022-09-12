let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let users = require("../initial-data/users.json");
let products = require("../initial-data/products.json");
let should = chai.should();

chai.use(chaiHttp);

const accessToken = "OvlTCHSYPlM92Hg9";

describe("User", () => {
  describe("/POST login", () => {
    it("it should return an access token", (done) => {
      let user = {
        username: "yellowleopard753",
        password: "jonjon",
      };
      chai
        .request(server)
        .post("/v1/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it("it should not return access token if credentials don't match exiting user", (done) => {
      let user = {
        username: "yellowleepard753",
        password: "jonjin",
      };
      chai
        .request(server)
        .post("/v1/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("it should not return access token if credentials are missing", (done) => {
      let user = {
        username: "yellowleopard753",
      };
      chai
        .request(server)
        .post("/v1/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
  describe("/GET user cart", () => {
    it("it should show the current user cart", (done) => {
      chai
        .request(server)
        .get(`/v1/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should not show the current user cart if user isn't verified", (done) => {
      chai
        .request(server)
        .get(`/v1/me/cart?`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
  describe("/POST item to user cart", () => {
    it("it should add selected item to the user's cart", (done) => {
      let product = products[0];
      chai
        .request(server)
        .post(`/v1/me/cart?accessToken=${accessToken}`)
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.be.an("object");
          done();
        });
    });
    it("it should not show the current user cart if user isn't verified", (done) => {
      chai
        .request(server)
        .post(`/v1/me/cart?accessToken=123456789`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/DELETE item from user cart", () => {
    it("it should delete the specified item from the user's cart", (done) => {
      let id = "4";
      chai
        .request(server)
        .delete(`/v1/me/cart/${id}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
    it("it should not delete items if the user isn't verified", (done) => {
      let id = "4";
      chai
        .request(server)
        .delete(`/v1/me/cart/${id}?accessToken=12345678`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST specified item to user cart", () => {
    it("it should change the quantity of a product in the cart", (done) => {
      let id = "4";
      chai
        .request(server)
        .post(`/v1/me/cart/${id}?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.be.an("object");
          done();
        });
    });
    it("it should not change the cart if user isn't verified", (done) => {
      chai
        .request(server)
        .post(`/v1/me/cart?accessToken=123456789`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/GET teapot error", () => {
    it("it should return the teapot error, just for fun.", (done) => {
      chai
        .request(server)
        .get("/v1/teapot")
        .end((err, res) => {
          res.should.have.status(418);
          done();
        });
    });
  });
});
