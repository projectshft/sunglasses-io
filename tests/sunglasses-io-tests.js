let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses-io", () => {

  describe("/GET/products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/GET/brands", () => {
    it("it should GET all the brands sold", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/GET/brands/:id/products", () => {
    it("it should GET all products from specified brand", (done) => {
      let brandId = '1';
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("it should NOT GET products with invalid brand id", (done) => {
      let brandId = '6';
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  });

  describe("/POST login", () => {
    it("it should return an access token on valid logins", (done) => {
      let loginAttempt = {
        username : "yellowleopard753",
        password : "jonjon"
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("string");
          res.body.length.should.be.eql(16);
          done();
        });
    });

    it("it should NOT log a user in if missing username or password", (done) => {
      let loginAttempt = {
        username: 'yellowleopard753'
      }

      let loginAttempt2 = {
        password: 'jonjon'
      }

      let loginAttempt3 = {}

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt3)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });

    })

    it("it should NOT login if no user exists", (done) => {
      let loginAttempt = {
        username: 'stephie',
        password: 'b'
      }

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    })
  });

  describe("/GET/me/cart", () => {
    it("it should GET all products in current user's cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          // must be logged in
          done();
        });
    });
  });

  describe("/POST/me/cart", () => {
    it("it should add an item to the user's cart", (done) => {
      let item = {
        id: 1,
        quantity: 5
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });
  });

  describe("/DELETE/me/cart/:productId", () => {
    it("it should add an item to the user's cart", (done) => {

      chai
        .request(server)
        .delete("/api/me/cart/1")
        .end((err, res) => {
          res.should.have.status(200);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });
  });

  describe("/PUT/me/cart/:productId", () => {
    it("it should update an item to the user's cart", (done) => {

      chai
        .request(server)
        .put("/api/me/cart/1")
        .end((err, res) => {
          res.should.have.status(200);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });
  });
});