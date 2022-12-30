//import products
let Products = require("../app/models/products");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server.js");

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all brands", done =>{
      chai
        .request(server)
        .get("/v1/brands")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("array");
          res.body.length.should.eql(5);
          done();
        });
    });

    it("it should GET products filtered by brand", done => {
      chai
        .request(server)
        .get("/v1/brands/Oakley")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("array");
          res.body.length.should.eql(3);
          done();
        });
    });
  });
});

describe("Products", () => {
  describe ("/GET products", () =>{
    it("it should GET all the products", done => {
      chai
        .request(server)
        .get("/v1/products")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("array");
          res.body.length.should.eql(11);
          done();
        });
    });

    it("it should GET product by ID", done =>{
      chai
        .request(server)
        .get("/v1/products/1")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("object");
          res.body.should.deep.equal({
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          });
          done();
        });
    });
  });
});