//import products
let Products = require("../app/models/products");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server.js");

let should = chai.should();

chai.use(chaiHttp);

//add a failed api test

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all brands", done =>{
      chai
        .request(server)
        .get("/api/brands")
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
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
        .get("/api/brands/Oakley/products")
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
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
        .get("/api/products")
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
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
        .get("/api/products/1")
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
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
          done()
        });
    });
  });
});

describe("User", () =>{
  describe("/GET User", () => {
    it("it should login the user with correct inputs", done => {
      chai
      .request(server)
      .get("/api/login?email=natalia.ramos%40example.com&password=waters")
      .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
      .end((err, res) =>{
        res.should.have.a.status("200");
        res.body.should.be.a("string");
        done();
      })
      
    })
    it("it should NOT login user with incorrect password", done => {
      chai
      .request(server)
      .get("/api/login?email=natalia.ramos%40example.com&password=wrongpassword")
      .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
      .end((err, res) =>{
        res.should.have.a.status("401");
        done();
      })
    })
  })

/*   describe("/POST user", () => {
    it("should")
  }) */
})