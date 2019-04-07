let chai = require("chai");
let chaiHttp = require("chai-http");
let server = "http://localhost:3001";
let expect = require("chai").expect;
let should = chai.should();

chai.use(chaiHttp);

describe("/GET brands", () => {
  //GET all Brands - should return 200 Successful operation.
  it("it should GET all the brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        res.body[0].should.have.deep.keys("id", "name");
        res.body[4].should.have.deep.property("name", "Burberry");
        res.body.should.have.length(5);
        done();
      });
  });
});

describe("/GET /brands/{brandId}/products", () => {
  //GET all products of a specific brandId - successful - should return 200 Successful operation
  it("it should GET all brandId products", done => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        res.body[0].should.have.deep.keys(
          "id",
          "categoryId",
          "name",
          "description",
          "price",
          "imageUrls"
        );
        res.body[0].should.have.deep.property("name", "Superglasses");
        res.body[0].should.have.deep.property(
          "description",
          "The best glasses in the world"
        );
        done();
      });
  });
  //GET all products of a specific brandId - invalid input - should return 400 Invalid brandId supplied.
  it("it should return 400", done => {
    chai
      .request(server)
      .get("/api/brands/potato/products")
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  //GET all products of a specific brandId - brandId does not exist - should return 404 brandId not found.
  it("it should return 404", done => {
    chai
      .request(server)
      .get("/api/brands/7/products")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("/GET /products", () => {
  //GET all products - should return 200 - Successful operation.
  it("it should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        res.body[0].should.have.deep.keys(
          "id",
          "categoryId",
          "name",
          "description",
          "price",
          "imageUrls"
        );
        res.body[0].should.have.deep.property("name", "Superglasses");
        res.body[0].should.have.deep.property(
          "description",
          "The best glasses in the world"
        );
        done();
      });
  });
  //GET all products - optional query product results based off string query - should return 200 Successful operation.
  it("it should GET all products related to the query", done => {
    chai
      .request(server)
      .get("/api/products?query=dkny")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an("array");
        res.body[0].should.have.deep.keys(
          "id",
          "categoryId",
          "name",
          "description",
          "price",
          "imageUrls"
        );
        res.body[0].should.have.deep.property("name", "Coke cans");
        res.body[0].should.have.deep.property(
          "description",
          "The thickest glasses in the world"
        );
        done();
      });
  });
  //GET all products - optional query product results based off invalid string query - should return 400 Invalid search
  it("it should return 400", done => {
    chai
      .request(server)
      .get(
        "/api/products?query=hellothereiamarealllllllllllllllllllllllylongstring"
      )
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  //GET all products - optional query product results based off valid but non-existent string query - should return 404 No results found.
  it("it should return 404", done => {
    chai
      .request(server)
      .get("/api/products?query=asdf")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("GET /me/cart", () => {
  //GET contents of users cart while logged in - should return 200 Successful operation.
  it("should get user cart contents", done => {
    chai
      .request(server)
      .get("/api/me/cart?accessToken=Qr2vWo9yEcJxFUm6")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body[0].should.have.deep.property("productId", "3");
        res.body[0].should.have.deep.property("quantity", "25");
        done();
      });
  });
  //GET contents of users cart while not logged in - should return 403 Not authorized. User must login to view cart.
  it("should return 403", done => {
    chai
      .request(server)
      .get("/api/me/cart")
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
});

describe("/POST /me/cart", () => {
  //POST to cart to update an item quantity while logged in - should return 200 Update successful.
  //returning user cart for testing
  it("it should update the quantity of an existing cart item", done => {
    update = {
      productId: "3",
      quantity: "26"
    };
    chai
      .request(server)
      .post("/api/me/cart?accessToken=Qr2vWo9yEcJxFUm6")
      .send(update)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("productId", "3");
        res.body.should.have.property("quantity", "26");
        done();
      });
  });
  //POST to cart to update an item quantity while not logged in - should return 403 Not authorized. User must login to update cart.
  it("should return 403", done => {
    chai
      .request(server)
      .post("/api/me/cart")
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
  //POST to cart to update an item quantity while logged in, but invalid productId or quantity - should return 400 Invalid product id or quantity.
  it("should return 400", done => {
    update = {
      productId: "dog",
      quantity: "26"
    };
    chai
      .request(server)
      .post("/api/me/cart?accessToken=Qr2vWo9yEcJxFUm6")
      .send(update)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  //POST to cart to update an item quantity while logged in, but productId not in cart - should return 404 ProductId not found in cart.
  it("should return 404", done => {
    update = {
      productId: "27",
      quantity: "26"
    };
    chai
      .request(server)
      .post("/api/me/cart?accessToken=Qr2vWo9yEcJxFUm6")
      .send(update)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("/DELETE /me/cart/{productId}", () => {
  //DELETE item from cart successfully - should return 200 Successful operation
  //Returning user cart for testing
  it("it should delete the item from the user's cart", done => {
    chai
      .request(server)
      .delete("/api/me/cart/2?accessToken=j39dcl12mdksd365")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.not.have.deep.property("productId", "2");
        res.body[0].should.have.property("productId", "4");
        done();
      });
  });
  //DELETE item from cart - user not logged in - should return 403 Not authorized. User must login to update cart.
  it("should return 403", done => {
    chai
      .request(server)
      .delete("/api/me/cart/2")
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
  //DELETE item from cart - invalid productId - should return 400 productId invalid.
  it("should return 400", done => {
    chai
      .request(server)
      .delete("/api/me/cart/purple?accessToken=j39dcl12mdksd365")
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  //DELETE item from cart - valid productId but not in cart - should return 404 productId not found in cart.
  it("should return 404", done => {
    chai
      .request(server)
      .delete("/api/me/cart/3?accessToken=j39dcl12mdksd365")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("/POST /me/cart/{productId}", () => {
  //POST item to cart by productId successfully - should return 200 Successful operation.
  //returning user cart for testing
  it("it should post an item to the users cart by productId", done => {
    chai
      .request(server)
      .post("/api/me/cart/2?accessToken=Qr2vWo9yEcJxFUm6")
      .end((err, res) => {
        res.should.have.status(200);
        res.body[1].should.have.deep.property("productId", "2");
        res.body[1].should.have.deep.property("quantity", "1");
        done();
      });
  });
  //POST item to cart by productId - user not logged in - should return 403 - Not authorized. User must login to update cart.
  it("should return 403", done => {
    chai
      .request(server)
      .post("/api/me/cart/2")
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
  //POST item to cart by productId - invalid productId - should return 400 productId is invalid or doesn't exist.
  it("should return 400", done => {
    chai
      .request(server)
      .post("/api/me/cart/chewbacca?accessToken=Qr2vWo9yEcJxFUm6")
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
  //POST item to cart by productId - productId not in db - should return 404 productId doesn't exist.
  it("should return 404", done => {
    chai
      .request(server)
      .post("/api/me/cart/213?accessToken=Qr2vWo9yEcJxFUm6")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe("/POST login", () => {
  //POST user login with email/password - success - should return 200 Login successful.
  it("it should successfully log the user in and return a token", done => {
    const userCredentials = {
      email: "susanna.richards@example.com",
      password: "jonjon"
    };
    chai
      .request(server)
      .post("/api/login")
      .send(userCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.token.length.should.equal(16);
        done();
      });
  });
  //POST user login with email/password - fail - should return 401 Invalid username or password.
  it("should return 401", done => {
    const userCredentials = {
      email: "bademail@example.com",
      password: "blarg"
    };
    chai
      .request(server)
      .post("/api/login")
      .send(userCredentials)
      .end((err, res) => {
        res.should.have.status(401);
        should.equal(res.body.token, undefined);
        done();
      });
  });
});
