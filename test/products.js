let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products whose description includes the search query", (done) => {
      // 4 of the products are described as "best glasses in the world, including the Superglasses
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
        .get("/api/products")
        .query( {query: "best"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(4);
          res.body.should.deep.include.members(superglasses);
          done();
        });
    });
  });
});