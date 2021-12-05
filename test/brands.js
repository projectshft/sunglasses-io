let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

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

  describe("/GET brands/:id/products", () => {
    it("it should return a 404 if no products of the requested brand are found", (done) => {
      let id = "123456789";

      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
      });
    });
  })

  describe("/GET brands/:id/products", () => {
    it("it should GET all products of the requested brand", (done) => {
      // brand id 1 is Oakley, which has 3 products in the store, including the Superglasses
      let id = "1";
      let superglasses = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }

      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(3);
          res.body.should.deep.include.members(superglasses);
          done();
      });
    });
  })
});