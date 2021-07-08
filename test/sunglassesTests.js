let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
var fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses.io", () => {
  describe("When requesting all the brands", () => {
    it("should list all the brands in the store", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When requesting all products from a specific brand", () => {
    it("should return a list of all products from a specific brand", (done) => {
      chai
        .request(server)
        .get("/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.every((product) => product.categoryId == 1);
          done();
        });
    });

    it("should return an error if the brand requested doesn't exist", (done) => {
      let brands = [];

      fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
      });

      const invalidBrandId = () => {
        let randomNumber = Math.random();

        while (brands.some((brand) => brand.id === randomNumber)) {
          randomNumber += 100;
        }

        return randomNumber;
      };

      chai
        .request(server)
        .get(`/brands/${invalidBrandId()}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
