const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

// Tests for GET /api/brands endpoint

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.lengthOf(5);
        done();
      });
  });
});

// Tests for GET /api/products endpoint

describe("/GET products", () => {
  it.only("should GET all products on empty query", done => {
    chai
      .request(server)
      .get("/api/products?query=")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.lengthOf(11);
        done();
      });
  });
  it.only("should GET all matching products based on user query", done => {
    chai
      .request(server)
      .get("/api/products?query=sweetest")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only("should receive a 404 error on query with no matches", done => {
    chai
      .request(server)
      .get("/api/products?query=holybatman")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(404);
        done();
      });
  });
});

// Tests for GET /api/brands/:id/products endpoint

describe("/GET products by brand ID", () => {
  it.only("should GET all products for a brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.lengthOf(3);
        done();
      });
  });
  it.only("should receive a 404 error for no matches to brand ID", done => {
    chai
      .request(server)
      .get("/api/brands/6/products")
      .end((error, response) => {
        assert.exists(response.body);
        expect(response).to.have.status(404);
        done();
      });
  });
});

// Tests for POST /api/login endpoint

let token = null;

describe("/POST login a user", () => {
  it.only("should login the user", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({username: 'greenlion235', password: 'waters'})
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(response.body).to.be.lengthOf(16);
        expect(response.body).to.be.a("string");
        token = response.body;
        done();
      });
  });
  it.only("should receive a 401 error if an invalid username or password is sent", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({username: 'wronguser', password: 'wrongpass'})
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(401);
        done();
      });
  });
  it.only("should receive a 400 error if incorrectly formatted credentials", done => {
    chai
      .request(server)
      .post("/api/login")
      .send({username: 'baduser'})
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(400);
        done();
      });
  });
});

// Tests for /api/me/cart/:productId POST endpoint

describe("/POST add a product to cart", () => {
  it.only("should add a new product to a users cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/1")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.a("array");
        expect(response.body).to.be.lengthOf(1);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 1
          }
        ]);
        done();
      });
  });
  it.only("should add a new product to a users cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/2")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.a("array");
        expect(response.body).to.be.lengthOf(2);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 1
          },
          {
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price":100,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 1
          }
        ]);
        done();
      });
  });
  it.only("should update quantity of product in cart if already in cart", done => {
    chai
      .request(server)
      .post("/api/me/cart/2")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.a("array");
        expect(response.body).to.be.lengthOf(2);
        expect(response.body[1].quantity).to.eql(2);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 1
          },
          {
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price":100,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 2
          }
        ]);
        done();
      });
  });
  it.only("should receive a 400 error if product Id is invalid", done => {
    chai
      .request(server)
      .post("/api/me/cart/15")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(400);
        expect("Content-Type", "application/json");
        done();
      });
  });
  it.only("should receive a 401 error if supplied a bad token", done => {
    chai
      .request(server)
      .post("/api/me/cart/3")
      .set('token', 'badToken')
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(401);
        done();
      });
  });
});

// Tests for /api/me/cart GET endpoint

describe("/GET a users cart", () => {
  it.only("should get the contents of a users cart", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.an("array");
        expect(response.body).to.be.lengthOf(2);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 1
          },
          {
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price":100,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 2
          }
        ]);
        done();
      });
  });
  it.only("should receive a 401 error if supplied a bad token", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .set('token', 'badToken')
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(401);
        done();
      });
  });
});

// Tests for /api/me/cart PUT endpoint

describe("/PUT update quantities of a users cart", () => {
  it.only("should update the quantities of a users cart", done => {
    chai
      .request(server)
      .put("/api/me/cart")
      .set("token", token)
      .send({updatedQuantities: [20, 25]})
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.an("array");
        expect(response.body).to.be.lengthOf(2);
        expect(response.body[0].quantity).to.eql(20);
        expect(response.body[1].quantity).to.eql(25);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 20
          },
          {
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price":100,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 25
          }
        ]);
        done();
      });
  });
  it.only("should receive a 401 error if supplied a bad token", done => {
    chai
      .request(server)
      .put("/api/me/cart")
      .set('token', 'badToken')
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(401);
        done();
      });
  });
});

// Tests for /api/me/cart/:productId DELETE endpoint

describe("/DELETE a product", () => {
  it.only("should delete a product from a users cart", done => {
    chai
      .request(server)
      .delete("/api/me/cart/2")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(200);
        expect("Content-Type", "application/json");        
        expect(response.body).to.be.a("array");
        expect(response.body).to.be.lengthOf(1);
        expect(response.body).to.deep.equal([
          {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            "quantity": 20
          }
        ]);
        done();
      });
  });
  it.only("should receive a 400 error if product Id is invalid", done => {
    chai
      .request(server)
      .post("/api/me/cart/18")
      .set('token', token)
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(400);
        expect("Content-Type", "application/json");
        done();
      });
  });
  it.only("should receive a 401 error if supplied a bad token", done => {
    chai
      .request(server)
      .delete("/api/me/cart/3")
      .set('token', 'badToken')
      .end((error, response) => {
        assert.isNull(error);
        expect(response).to.have.status(401);
        done();
      });
  });
});