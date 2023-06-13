// Bring in chai
// Bring in server
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiThings = require("chai-things");
let server = require("../app/server");
let should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
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

  describe("/GET products by brand id", () => {
    it("should GET all products with corresponding brand id", (done) => {
      id = "1";
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.all.have.property("categoryId", id);
          done();

        })
    })
  })
});

describe("Products", () => {
  describe("/GET products", () => {
    it("should GET all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("User", () => {
  describe("/GET user's cart", () => {
    it("should GET the user's cart", (done) => {
      chai
        .request(server)
        .get("/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/POST product to cart", () => {
    it("should POST product to user's cart", (done) => {
      const product = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    };
    chai
      .request(server)
      .post("/me/cart")
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.all.have.property("quantity");
        done();
      });
    });
  });

  describe("/DELETE product from cart", () => {
    it("should DELETE a product from the cart given the product id", (done) => {
      const productId = "1";
      const cart = [
        {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price":100,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
      ];

      chai
        .request(server)
        .delete(`/me/cart/${productId}`)
        .send(cart)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.all.not.have.property("id", productId)
          done();
        })
    })
  })
});