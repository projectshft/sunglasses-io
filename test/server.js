// import chai from 'chai';
// import chaiHttp from "chai-http";
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

chai.use(chaiHttp);

// beforeEach(() => {

// });

describe("Sunglasses", () => {
  describe("/GET api/brands", () => {
    it("it should get all brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          console.log("res: ");
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        })
    })
  })
  describe("/GET api/brands/:id/products", () => {
    it("it should get products with the brand id", (done) => {
      // arrange: brand id that exists 
      let id = 1;
      // act: server request
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done(err);
        })
    })
    it("it should not return products for non existent brand or :id", (done) => {
      // arrange: brand id that does not exist
      let id = 10;
      // act: server request
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(500);
          done(err);
        })
    })
  })
  describe("/GET /api/products", () => {
    it("it should get all the products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          console.log("res: ");
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done(err);
        });
    })
  })
  describe("/POST login", () => {
    it("it should POST the login", (done) => {
      // arrange: username and password
      let username = "yellowleopard753";
      let password = "jonjon";
      // act: server request
      chai
        .request(server)
        .post("/login")
        .send()
        .end((err, res) => {
          done(err);
        })

    })
  })
  describe("/GET me/cart", () => {
    it("it should GET the user cart", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          done(err);
        })
    })

  })
  describe("/POST me/cart", () => {
    it("it should POST to the user cart", (done) => {
      chai
        .request(server)
        .post("/")
        .send()
        .end((err, res) => {
          done(err);
        })
    })

  })
  describe("/DELETE me/cart/:productId", () => {
    it("it should DELETE the product with productId from the user cart", (done) => {
      chai
        .request(server)
        .delete("/")
        .end((err, res) => {
          done(err);
        })

    })
  })
  describe("/POST me/cart/:productId", () => {
    it("it should POST product with productId to user cart", (done) => {
      chai
        .request(server)
        .post("/")
        .send()
        .end((err, res) => {
          done(err);
        });
    })
  })
})
