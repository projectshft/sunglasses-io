let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let should = chai.should();
chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/v1/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  // describe("/GET/:id/products products", () => {
  //   it("it should GET all products by the given brand id", (done) => {
  //     chai
  //       .request(server)
  //       .get("/brands/" + brand.id + "/products")
  //       .send(brand)
  //   })
  // })
})