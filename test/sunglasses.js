let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("Brands", () => {
    describe("/GET brand", () => {
      it("it should GET all the brands", (done) => {
        chai
          .request(server)
          .get("/api/brands")
          .end((err, res) => {
            // console.log(res.body)
            res.should.have.status(200);
            res.body.should.be.an("array");
            done();
          })
      })
    })
  })

  describe("Products", () => {
    describe("/GET products", () => {
      it("it should GET all the products", (done) => {
        chai
          .request(server)
          .get("/api/products")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            // console.log(res.body);
            done();
          })
      })
    })
  })

})

