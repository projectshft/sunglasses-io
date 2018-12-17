const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET brands
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
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
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/brands?query=Oakley")
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
});

//GET PRODUCTS
describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(11);
        done();
      });
  });
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=Pretty")
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
  it.only("returns all products if query is missing", done => {
    chai
      .request(server)
      //property doesn't exist
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
  it.only("should sort results when given a sort parameter", done => {
    chai
      .request(server)
      .get("/api/products?sort=price")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        expect(res.body).to.be.sortedBy("price");
        done();
      });
  });
  it("fails as expected when unrecognized property", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/api/products?sort=sdfv")
      .end((err, res) => {
        expect(err).to.not.be.null;
        expect(res).to.have.status(404);
        done();
      });
  });
});

  //LOGIN
  describe("/POST login", () => {
    it.only("should POST a login ", done => {
      //arrange
      let login = {
        username: "yellowleopard753",
        password: "jonjon"
      }
      chai.request(server)
        .post("/api/login")
        .send(login)
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("username");
          expect(res.body).to.have.property("password");
          expect("Content-Type", "application/json");
          done()
        })
    })
  })

  //GET CART
  describe("/GET Individual cart", () => {
    it.only("should GET cart", done => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          expect("Content-Type", "application/json");
          done();
        });
    });
  });

  //ITEMS IN CART
  describe("/POST cart", () => {
    it.only("should POST cart", done => {

      let cart = [{
        id: "1",
        name: "Superglasses"
      }]

      chai.request(server)
        .post("/api/me/cart")
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect("Content-Type", "application/json");
          done();
        });
    });
  });

  //DELETE ITEM IN CART

  describe("/DELETE item in cart", () => {
    it.only("should DELETE item in cart", done => {

      let cart = [{
        id: "1",
        name: "Superglasses"
      }]

      chai.request(server)
        .delete("/api/me/cart")
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect("Content-Type", "application/json");
          done();
        });
    });
  });

   //AN INDIVIDUAL ITEM IN CART
   describe("/POST Item in cart", () => {
    it.only("should POST An item in cart", done => {
      let cart = []


      chai
        .request(server)
        .get("/api/me/cart/:productId")
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect("Content-Type", "application/json");
          done();
        });
    });
  });