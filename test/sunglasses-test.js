let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId


describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });
  describe("/GET/brands/:id/products", () => {
    it("should GET all the products for specified brand", (done) => {
      chai
        .request(server)
        .get("/api/brands/2/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(2);
          done();
        });
    });
    it("should return 404 on invalid brandId"), (done) => 
      {
        chai  
          .request(server)
          .get("/api/brands/6")
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      }
  });
});

describe("Products", () => {
  describe("/GET products", () => {
      it("it should GET all the products", (done) => {
        chai
          .request(server)
          .get("/api/products")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(11);
            done();
          });
      });
      it("should only return items matching the search term", (done) => {
        chai 
          .request(server)
          .get("/api/products?query=Superglasses")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(1);
            done();
          })
      })
    });
  });

describe("Login", () => {
  describe("/POST login", () => {
      it("it should POST user login information", (done) => {
        const user = {
          username: 'yellowleopard753',
          password: 'jonjon'
        }
        chai
          .request(server)
          .post(`/api/login?username=${user.username}&password=${user.password}`)
          .end((err, res) => {
            res.should.have.status(200);
            // Looking for access token
            res.body.should.be.a("string");
            done();
          });
      });

      it("should return 400 if params not included", (done) => {
        const user = {
          username: '',
          password: 'jonjon'
        }
        chai
          .request(server)
          .post(`/api/login?username=${user.username}&password=${user.password}`)
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });

      it("should return 401 if login credentials are invalid", (done) => {
        const user = {
          username: 'wrongusername',
          password: 'wrongpassword'
        }
        chai
          .request(server)
          .post(`/api/login?username=${user.username}&password=${user.password}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
    });
  });

describe("Cart", () => {
  describe("/GET cart", () => {
      it("it should GET the user's cart", (done) => {
        const accessToken = '5e09efdf-9e7e-400f-8468-d79ebf39c185'
        chai
          .request(server)
          .get(`/api/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(0);
            done();
          });
      });
      it("it should return 401 if access token is invalid", (done) => {
        chai
          .request(server)
          .get(`/api/me/cart?accessToken=wrongtoken`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
    });

  describe("/POST cart", () => {
      it("it should POST new item to user's cart", (done) => {
        const productId = 1
        const accessToken = '5e09efdf-9e7e-400f-8468-d79ebf39c185'
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(0);
            done();
          });
      });
      it("it should return 401 if access token is invalid", (done) => {
        const productId = 1
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=wrongtoken&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
      it("it should return 404 if no product with that ID is found", (done) => {
        const productId = 12
        const accessToken = '5e09efdf-9e7e-400f-8468-d79ebf39c185'
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });

  describe("/DELETE cart item", () => {
      it("it should DELETE specific item from user's cart", (done) => {
        const productId = 1
        const accessToken = 'e32a7da0-6b18-4a37-a443-055952e19a23'
        chai
          .request(server)
          .delete(`/api/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("it should return 401 if access token is invalid", (done) => {
        const productId = 1
        chai
          .request(server)
          .delete(`/api/me/cart?accessToken=wrongtoken&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
      it("it should return 404 if no product with that ID is found", (done) => {
        const productId = 12
        const accessToken = 'e32a7da0-6b18-4a37-a443-055952e19a23'
        chai
          .request(server)
          .delete(`/api/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });
describe("/POST cart item", () => {
      it("it should POST additional items to a user's cart", (done) => {
        const productId = 2
        const quantity = 3
        const accessToken = 'e32a7da0-6b18-4a37-a443-055952e19a23'
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=${accessToken}&productId=${productId}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("it should return 401 if access token is invalid", (done) => {
        const productId = 2
        const quantity = 3
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=wrongtoken&productId=${productId}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });
      it("it should return 404 if no product with that ID is in the cart", (done) => {
        const productId = 4
        const quantity = 3
        const accessToken = 'e32a7da0-6b18-4a37-a443-055952e19a23'
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=${accessToken}&productId=${productId}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });
  });