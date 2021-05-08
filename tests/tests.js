let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let should = chai.should();
let expect = chai.expect;
let chaiSubset = require('chai-subset');

chai.use(chaiHttp);
chai.use(chaiSubset);


describe("Sunglasses", () => {
  //1
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

  //2
  describe("/GET/:id/products products", () => {
    it("it should GET all products by the given brand id", (done) => {
      let brand = {
        "id": "2",
        "name": "Ray Ban"
      }
      chai
        .request(server)
        .get("/v1/brands/" + brand.id + "/products")
        .send(brand)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body).to.containSubset([{ "brandId": brand.id }]);
          done();
        });
    });
  });

  //3
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/v1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  //4
  describe("/POST user login", () => {
    it("it should POST the user logging in", (done) => {
      chai
        .request(server)
        .post("/v1/login")
        .send({
          "username": "yellowleopard753",
          "password": "jonjon"
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        })
    })
  })

  describe("/GET user's cart", () => {
    it("it should GET all the products in the cart", (done) => {
      chai
        .request(server)
        .get("/v1/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          // should include a name and quantity
          done();
        })
    })
  })


  describe("/DELETE product", () => {
    it("it should DELETE the product with the ID", (done) => {
      let product = {
        "id": "4",
        "brandId": "2",
        "name": "Better glasses",
        "description": "The best glasses in the world",
        "price": 1500,
        "imageUrls": [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ]
      }
      chai
        .request(server)
        .delete("/v1/me/cart/" + product.id)
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.not.have.property("id").eql(product.id);
          done();
        });
    });
  });

  describe("/POST product", () => {
    it("it should UPDATE the product quantity", (done) => {
      let product = {
        "id": "4",
        "brandId": "2",
        "name": "Better glasses",
        "description": "The best glasses in the world",
        "price": 1500,
        "imageUrls": [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ],
        quantity: 1
      }
      chai
        .request(server)
        .post("/v1/me/cart/" + product.id)
        .send({
          "id": "4",
          "brandId": "2",
          "name": "Better glasses",
          "description": "The best glasses in the world",
          "price": 1500,
          "imageUrls": [
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
          ],
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("quantity").eql(3);
          done();
        });
    });
  });

});