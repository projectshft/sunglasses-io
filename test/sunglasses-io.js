let Sunglasses = require("../app/models/sunglasses-io");
const brandData = require("../app/initial-data/brands.json");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("/GET brands", () => {
    it("should get all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/Get products by brand", () => {
    it("should get all products in a given brand", (done) => {
      let brandRequestId = brandData[0].id;
      chai
        .request(server)
        .get(`/api/brands/${brandRequestId}/products`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });

    it("should return a 404 error if brandId is not found", (done) => {
      var get404BrandId = () => {
        let randomNumber = Math.floor(Math.random() * 10);
        if (brandData.find((brand) => brand.id !== randomNumber)) {
          return randomNumber;
        }
      };
      chai
        .request(server)
        .get(`/api/brands/${get404BrandId}/products`)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("/GET products", () => {
    it("should get all the products", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });
});
