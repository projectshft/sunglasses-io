//import products
const Products = require("../app/models/products");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server.js");
const should = chai.should();

chai.use(chaiHttp);
let token = null;
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
          done();
        });
    });
  });
});

describe("User", () =>{
  describe("/GET User", () => {
    it("it should login the user with correct inputs", done => {
      chai
      .request(server)
      .get("/api/user/login")
      .query({email: "natalia.ramos@example.com", password: "waters"})
      .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
      .end((err, res) =>{
        res.should.have.a.status("200");
        res.body.should.be.a("string");
        token = JSON.parse(res.text);
        done();
      });
      
    })
    it("it should NOT login user with incorrect password", done => {
      chai
      .request(server)
      .get("/api/user/login")
      .query({email: "natalia.ramos@example.com", password: "wrongpassword"})
      .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
      .end((err, res) =>{
        res.should.have.a.status("401");
        done();
      });
    });
  });
});

describe("Cart", () => {
  describe("/POST user", () => {
    it("it should add to cart", done => {
      chai
        .request(server)
        .post("/api/user/cart/1")
        .query({accessToken: token})
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("array");
          res.body.should.deep.equal([{
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }])
          done();
        });
    });
    it("it should NOT add to cart with invalid product ID", done => {
      chai
        .request(server)
        .post("/api/user/cart/30")
        .query({accessToken: token})
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
        .end((err, res) => {
          res.should.have.a.status("400");
          done();
        });
    });
  });

  describe("/DELETE user", () => {
    it("it should delete from the cart", done => {
      chai
        .request(server)
        .delete("/api/user/cart/1")
        .query({accessToken: token})
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.a("array");
          res.body.length.should.be.equal(0);
          done();
        });
    });
    it("it should NOT delete from the cart with invalid access token", done => {
      chai
        .request(server)
        .delete("/api/user/cart/1")
        .query({accessToken: "invalidToken"})
        .set("x-authentication", "e347a542-b8dc-49a7-a5c5-aa6c889b1826")
        .end((err, res) => {
          res.should.have.a.status("401");
          done();
        });
    });
  });
})