let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();
let TEST_TOKEN = '1111111111111111';

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
      // is there a way to set up a user's accessToken?
      chai
        .request(server)
        .get("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("it should NOT GET products if user is not logged in", (done) => {
      chai
      .request(server)
      .get("/api/me/cart")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });

  describe("/POST/me/cart", () => {
    it("it should POST an item to a logged in user's cart", (done) => {
      let item = {
        id: 1,
        quantity: 5
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('quantity');
          done();
        });
    });
    
    it("it should not POST add an item to cart if user not logged in", (done) => {
      let item = {
        id: 1,
        quantity: 5
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .send(item)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    
    it("it should not POST add an item to cart if missing quantity", (done) => {
      let item = {
        id: 1,
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .send(item)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe("/DELETE/me/cart/:productId", () => {
    it("it should DELETE an item from the user's cart", (done) => {
      // how do i set up this test?
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });

    it("it should not DELETE an item if invalid id", (done) => {

      chai
        .request(server)
        .delete("/api/me/cart/3")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(404);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });
  });

  describe("/PUT/me/cart/:productId", () => {
    it("it should UPDATE an item to the user's cart", (done) => {

      let updatedItem = {
        id: '2',
        quantity: 100
      }

      chai
        .request(server)
        .put("/api/me/cart/2")
        .send(updatedItem)
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('quantity');
          done();
        });
    });

    it("it should not UPDATE an item with an invalid id", (done) => {

      let updatedItem = {
        id: '1',
        quantity: 100
      }

      chai
        .request(server)
        .put("/api/me/cart/1")
        .send(updatedItem)
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  });
});