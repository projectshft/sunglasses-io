let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();
chai.use(chaiHttp);

describe("Users", () => {
  describe("/GET me/cart", () => {
    it("it should return a 401 if the user does not have a valid access token", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .query({accessToken: "1234567890"})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should GET all items in the cart", (done) => {
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .get("/api/me/cart")
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe("/POST me/cart", () => {
    it("it should return a 401 if the user does not have a valid access token", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .query({accessToken: "1234567890"})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should return a 404 if the product is not found", (done) => {
      let product = {id: "100"};
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js

      chai
        .request(server)
        .post("/api/me/cart")
        .send({product})
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it("it should return a 200 and add the requested product to the cart", (done) => {
      let product = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .post("/api/me/cart")
        .send({product})
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("product");
          res.body.should.have.property("quantity");
          done();
      });
    });
  });

  describe("/POST me/cart/:productId", () => {
    it("it should return a 401 if the user does not have a valid access token", (done) => {
      let productId = "1";

      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .query({accessToken: "1234567890"})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should return a 400 if the request does not include a new product quantity", (done) => {
      let productId = "100";

      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("it should return a 404 if the product is not found", (done) => {
      let productId = "100";

      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .query({accessToken: "1qp0Im9oRzeBXcdF", newQuantity: 10})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it("it should return a 200 and update the quantity of the requested product in the cart", (done) => {
      let productId = "1";
  
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .query({accessToken: "1qp0Im9oRzeBXcdF", newQuantity: 10})
        .end((err, res) => {
          res.should.have.status(200);
          done();
      });
    });
  });

  describe("/DELETE me/cart/:productId", () => {
    it("it should return a 401 if the user does not have a valid access token", (done) => {
      let productId = "1";

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .query({accessToken: "1234567890"})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should return a 404 if the product is not found", (done) => {
      let productId = "100";
      
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it("it should return a 200 and remove the requested product from the cart", (done) => {
      let productId = "1";
      
      // use testing access token 1qp0Im9oRzeBXcdF for user greenlion235, which requires accessTokens array initialized with this user's authentication info in server.js
      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .query({accessToken: "1qp0Im9oRzeBXcdF"})
        .end((err, res) => {
          res.should.have.status(200);
          done();
      });
    });
  });
});