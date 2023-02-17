const { expect } = require("chai");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./app/server");

chai.use(chaiHttp);
let should = chai.should();

describe("Products", () => {
  describe("/GET products", () => {
    it("should get all the products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body).to.have.lengthOf.above(0);
          done();
        });
    });
  });
});

describe("Brands", () => {
  describe("/GET brands", () => {
    it("should get all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body).to.have.lengthOf.above(0);
          done();
        });
    });
    it("should get all the products of a brand", (done) => {
      let id = "1";
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body).to.have.lengthOf.above(0);
          expect(res.body[0].categoryId).to.equal(id);
          done();
        });
    });
  });
});

describe("Login", () => {
  describe("/POST login", () => {
    it("should login user successfully", (done) => {
      chai
        .request(server)
        .post(`/api/login?username=greenlion235&password=waters`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.text).to.equal("successfully logged in greenlion235");
          done();
        });
    });
  });
});

describe("Me", () => {
  describe("/GET cart", () => {
    it("should get the current user's cart", (done) => {
      currentUser = {
        gender: "female",
        cart: [],
        name: {
          title: "mrs",
          first: "natalia",
          last: "ramos",
        },
        location: {
          street: "7934 avenida de salamanca",
          city: "madrid",
          state: "aragón",
          postcode: 43314,
        },
        email: "natalia.ramos@example.com",
        login: {
          username: "greenlion235",
          password: "waters",
          salt: "w10ZFgoO",
          md5: "19f6fb510c58be44b2df1816d88b739d",
          sha1: "18e545aee27156ee6be35596631353a14ee03007",
          sha256:
            "2b23b25939ece8ba943fe9abcb3074105867c267d122081a2bc6322f935ac809",
        },
        dob: "1947-03-05 15:23:07",
        registered: "2004-07-19 02:44:19",
        phone: "903-556-986",
        cell: "696-867-013",
        picture: {
          large: "https://randomuser.me/api/portraits/women/54.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/54.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/54.jpg",
        },
        nat: "ES",
      };
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          if (res.body.length > 0) {
            res.body[0].should.have.key("price");
          }
          done();
        });
    });
  });
  describe("/POST cart", () => {
    it("should add products to cart", (done) => {
      currentCart = {
        cart: [
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
        ],
      };
      chai
        .request(server)
        .post("/api/me/cart?productId=1")
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.lengthOf.above(0);
          expect(currentCart.cart).to.deep.equal(res.body);
          done();
        });
    });
  });
  describe("DELETE product", () => {
    it("should remove a product from the cart", (done) => {
      currentCart = {
        cart: [
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
        ],
      };
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.lengthOf(1);
          expect(res.body).to.deep.equal(currentCart.cart);
          done();
        });
    });
  });
  describe("POST product quantity", () => {
    it("should edit the quantity of a product in cart", (done) => {
      currentCart = {
        cart: [
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
          {
            id: "1",
            categoryId: "1",
            name: "Superglasses",
            description: "The best glasses in the world",
            price: 150,
            imageUrls: [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
            ],
          },
        ],
      };
      chai
        .request(server)
        .post("/api/me/cart/1?quantity=4")
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.lengthOf(4);
          expect(res.body).to.deep.equal(currentCart.cart);
          done();
        });
    });
  });
});
