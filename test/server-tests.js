const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;

const EXPECTED_LENGTH_OF_ALL_BRANDS = 5;
const EXPECTED_LENGTH_OF_ALL_PRODUCTS = 11;

const BRAND_FILTER = "1";
const EXPECTED_LENGTH_OF_BRAND_FILTERED_PRODUCTS = 3;

const BAD_BRAND_ID = "00000000000000000000000000000";

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

let checkForValidArrayBodyResponse = response => {
  expect(response.body).to.not.be.null;
  expect(response).to.have.status(200);
  expect(response).to.have.header("Content-Type", "application/json");
  expect(response.body).to.be.an("array");
};

let checkForValidBrand = brand => {
  expect(brand).to.be.an("object");
  expect(brand).to.have.property("id");
  expect(brand).to.have.property("name");
  //id existence check
  expect(brand["id"]).to.exist;
  expect(brand["id"]).to.not.be.empty;
  expect(brand["id"]).to.be.a("string");
  expect(brand["name"]).to.be.a("string");
};

let checkForValidIssueResponse = (response, expectedCode) => {
  expect(response.body).to.not.be.null;
  expect(response).to.have.status(expectedCode);
  expect(response).to.have.header("Content-Type", "application/json");
  expect(response.body).to.not.be.null;
  expect(response.body).to.be.an("object");
  expect(response.body).to.have.property("code");
  expect(response.body).to.have.property("message");
  expect(response.body.code).to.be.a("number");
  expect(response.body.code).to.equal(expectedCode);
  expect(response.body.message).to.exist;
  expect(response.body.message).to.not.be.empty;
  expect(response.body.message).to.be.a("string");
};

let checkForValidBrandsArray = brands => {
  let usedIds = [];
  brands.forEach(brand => {
    checkForValidBrand(brand);
    //check for unique keys
    let exists = usedIds.includes(brand["id"]);
    expect(exists).to.be.false;
    usedIds.push(brand["id"]);
  });
};

let checkForValidProduct = product => {
  expect(product).to.be.an("object");
  //property check
  expect(product).to.have.property("id");
  expect(product).to.have.property("categoryId");
  expect(product).to.have.property("name");
  expect(product).to.have.property("description");
  expect(product).to.have.property("price");
  expect(product).to.have.property("imageUrls");
  //id existence check
  expect(product["id"]).to.exist;
  expect(product["id"]).to.not.be.empty;
  //category is required for other end points?
  expect(product["categoryId"]).to.exist;
  expect(product["categoryId"]).to.not.be.empty;
  expect(product["categoryId"]).to.be.a("string");
  //type checking
  expect(product["id"]).to.be.a("string");
  expect(product["categoryId"]).to.be.a("string");
  expect(product["name"]).to.be.a("string");
  expect(product["description"]).to.be.a("string");
  expect(product["price"]).to.be.a("number");
  expect(product["imageUrls"]).to.be.a("array");
  //make sure imageUrls is array of strings
  product["imageUrls"].forEach(image => {
    expect(image).to.exist;
    expect(image).to.not.be.empty;
    expect(image).to.be.a("string");
  });
};

let checkForValidProductsArray = products => {
  let usedIds = [];
  products.forEach(product => {
    checkForValidProduct(product);
    //check for unique keys
    let exists = usedIds.includes(product["id"]);
    expect(exists).to.be.false;
    usedIds.push(product["id"]);
  });
};

let checkForValidCartItemsArray = cartItems => {
  cartItems.forEach(product => {
    expect(product).to.be.an("object");
    //property check
    expect(product).to.have.property("quantity");
    expect(product["quantity"]).to.be.a("number");
    expect(product["quantity"]).to.be.gt(0);

    expect(product).to.have.property("product");
    expect(product["product"]).to.be.a("object");
    checkForValidProduct(product["product"]);
  });
};

describe("/GET brands", () => {
  it("should GET all brands with no additional parameters", done => {
    chai
      .request(server)
      .get("/v1/brands")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_BRANDS);
        checkForValidBrandsArray(response.body);
        done();
      });
  });

  it("`Should return a filtered brands list when provided a valid query: DKNY`", done => {
    chai
      .request(server)
      .get("/v1/brands?query=DKNY")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(1);
        checkForValidBrandsArray(response.body);
        done();
      });
  });

  it(`Should return a filtered brands list when provided a valid query (case insensitive): dKnY`, done => {
    chai
      .request(server)
      .get("/v1/brands?query=dKnY")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(1);
        checkForValidBrandsArray(response.body);
        done();
      });
  });

  it("Should return all brands when provided only spaces", done => {
    chai
      .request(server)
      .get("/v1/brands?query=   ")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_BRANDS);
        checkForValidBrandsArray(response.body);
        done();
      });
  });

  it("Should return all brands when provided with and empty string", done => {
    chai
      .request(server)
      .get("/v1/brands?query=")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_BRANDS);
        checkForValidBrandsArray(response.body);
        done();
      });
  });

  it("Should return no products when provided with an unmatched query", done => {
    chai
      .request(server)
      .get("/v1/brands?query=THEREDEFINITELYISNTASUNGLASSNAMEDTHIS")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(0);
        checkForValidBrandsArray(response.body);
        done();
      });
  });
});

describe("/GET products", () => {
  it("should GET all products with no additional parameters", done => {
    chai
      .request(server)
      .get("/v1/products")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_PRODUCTS);
        checkForValidProductsArray(response.body);
        done();
      });
  });

  it("`Should return a filtered products list when provided a valid query: Coke`", done => {
    chai
      .request(server)
      .get("/v1/products?query=Coke")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(1);
        checkForValidProductsArray(response.body);
        done();
      });
  });

  it(`Should return a filtered products list when provided a valid query (case insensitive): cOkE`, done => {
    chai
      .request(server)
      .get("/v1/products?query=cOkE")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(1);
        checkForValidProductsArray(response.body);
        done();
      });
  });

  it("Should return all products when provided only spaces", done => {
    chai
      .request(server)
      .get("/v1/products?query=   ")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_PRODUCTS);
        checkForValidProductsArray(response.body);
        done();
      });
  });

  it("Should return all products when provided with and empty string", done => {
    chai
      .request(server)
      .get("/v1/products?query=")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_ALL_PRODUCTS);
        checkForValidProductsArray(response.body);
        done();
      });
  });

  it("Should return no products when provided with an unmatched query", done => {
    chai
      .request(server)
      .get("/v1/products?query=THEREDEFINITELYISNTASUNGLASSNAMEDTHIS")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(0);
        checkForValidProductsArray(response.body);
        done();
      });
  });
});

describe("/GET brands/:brandId/products", () => {
  it("should GET all products that match a valid specified brand id", done => {
    chai
      .request(server)
      .get(`/v1/brands/${BRAND_FILTER}/products`)
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body.length).to.be.lte(EXPECTED_LENGTH_OF_ALL_PRODUCTS);
        expect(response.body.length).to.be.equal(
          EXPECTED_LENGTH_OF_BRAND_FILTERED_PRODUCTS
        );

        checkForValidProductsArray(response.body);
        done();
      });
  });
  it("should return an error when brand does not exist", done => {
    chai
      .request(server)
      .get(`/v1/brands/${BAD_BRAND_ID}/products`)
      .end((error, response) => {
        checkForValidIssueResponse(response, 404);
        done();
      });
  });
});

describe("/POST api/login", () => {
  it("should POST a valid login and get back a valid response including an accessToken", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        //property check
        expect(response.body).to.have.property("accessToken");
        //accessToken existence check
        expect(response.body["accessToken"]).to.exist;
        expect(response.body["accessToken"]).to.not.be.empty;
        expect(response.body["accessToken"]).to.be.a("string");
        done();
      });
  });
  it("should POST a login with an invalid pass get back a 401 response noting invalid user/pass", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "wrongpass" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal(
          "Invalid username and/or Password"
        );
        done();
      });
  });
  it("should POST a login with an invalid username get back a 401 response noting invalid user/pass", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "badusername", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal(
          "Invalid username and/or Password"
        );
        done();
      });
  });
  it("should POST a login without a username get back a 400 response noting missing username", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ password: "password" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 400);
        expect(response.body.message).to.equal("Missing username");
        done();
      });
  });
  it("should POST a login without a password get back a 400 response noting missing", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "username" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 400);
        expect(response.body.message).to.equal("Missing Password");
        done();
      });
  });
  it("should POST a login without a username or password get back a 400 response noting missing", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 400);
        expect(response.body.message).to.equal("Missing username/Password");
        done();
      });
  });
  it("should POST a valid login a second time and get back a valid response including an accessToken", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        //property check
        expect(response.body).to.have.property("accessToken");
        //accessToken existence check
        expect(response.body["accessToken"]).to.exist;
        expect(response.body["accessToken"]).to.not.be.empty;
        expect(response.body["accessToken"]).to.be.a("string");
        done();
      });
  });
});

describe("/POST api/me/cart", () => {
  let accessToken = "";
  it("should POST a valid login and get back a valid response including an accessToken (for use in next tests)", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        //property check
        expect(response.body).to.have.property("accessToken");
        //accessToken existence check
        expect(response.body["accessToken"]).to.exist;
        expect(response.body["accessToken"]).to.not.be.empty;
        expect(response.body["accessToken"]).to.be.a("string");
        accessToken = response.body["accessToken"];
        done();
      });
  });
  it("should POST a valid item to the cart and return the full cart in response with the updated item/quantity", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({ productId: "1" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        checkForValidCartItemsArray(response.body);
        expect(response.body.length).to.equal(1);
        expect(response.body[0].quantity).to.equal(1);
        expect(response.body[0].product.id).to.equal("1");
        done();
      });
  });
  it("should POST the same item to the cart and return the full cart in response with the quantity for that product updated", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({ productId: "1" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        checkForValidCartItemsArray(response.body);
        expect(response.body.length).to.equal(1);
        expect(response.body[0].quantity).to.equal(2);
        expect(response.body[0].product.id).to.equal("1");
        done();
      });
  });
  it("should POST a different item to the cart and return the full cart in response with the updated item/quantity", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({ productId: "2" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        checkForValidCartItemsArray(response.body);
        expect(response.body.length).to.equal(2);
        let cartItem1, cartItem2;
        cartItem1 = response.body.find(p => p.product.id === "1");
        cartItem2 = response.body.find(p => p.product.id === "2");
        expect(cartItem1).to.exist;
        expect(cartItem2).to.exist;
        expect(cartItem1.quantity).to.equal(2);
        expect(cartItem2.quantity).to.equal(1);
        done();
      });
  });
  it("should POST a non-existent item to the cart and return a 404 when item isn't found", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({ productId: "XYZ" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 404);
        expect(response.body.message).to.equal("Product does not exist");
        done();
      });
  });
  it("should POST an empty object and return a 400 for a bad body request", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 400);
        expect(response.body.message).to.equal("Missing Product In Body");
        done();
      });
  });
  it("should POST an valid object but forget accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .post(`/v1/api/me/cart`)
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
  it("should POST an valid object but an invalid accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .post(
        `/v1/api/me/cart?accessToken=definitelynotarealuidunlesswerereallylucky`
      )
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
});

describe("/GET api/me/cart", () => {
  let accessToken = "";
  it("POST a valid login and get back a valid response including an accessToken (for use in next tests)", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        //property check
        expect(response.body).to.have.property("accessToken");
        //accessToken existence check
        expect(response.body["accessToken"]).to.exist;
        expect(response.body["accessToken"]).to.not.be.empty;
        expect(response.body["accessToken"]).to.be.a("string");
        accessToken = response.body["accessToken"];
        done();
      });
  });
  it("should GET the complete cart for the user", done => {
    chai
      .request(server)
      .get(`/v1/api/me/cart?accessToken=${accessToken}`)
      .send({ productId: "1" })
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        checkForValidCartItemsArray(response.body);
        //from the posts above the cart currently has 2 items and 2 diff quantities on those items
        expect(response.body.length).to.equal(2);
        let cartItem1, cartItem2;
        cartItem1 = response.body.find(p => p.product.id === "1");
        cartItem2 = response.body.find(p => p.product.id === "2");
        expect(cartItem1).to.exist;
        expect(cartItem2).to.exist;
        expect(cartItem1.quantity).to.equal(2);
        expect(cartItem2.quantity).to.equal(1);
        done();
      });
  });
  it("should attempt to get the cart but forget accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .get(`/v1/api/me/cart`)
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
  it("should attempt to get the cart but have an invalid accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .get(
        `/v1/api/me/cart?accessToken=definitelynotarealuidunlesswerereallylucky`
      )
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
});

describe("/DELETE api/me/cart/:productId", () => {
  let accessToken = "";
  it("POST a valid login and get back a valid response including an accessToken (for use in next tests)", done => {
    chai
      .request(server)
      .post(`/v1/api/login`)
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        //property check
        expect(response.body).to.have.property("accessToken");
        //accessToken existence check
        expect(response.body["accessToken"]).to.exist;
        expect(response.body["accessToken"]).to.not.be.empty;
        expect(response.body["accessToken"]).to.be.a("string");
        accessToken = response.body["accessToken"];
        done();
      });
  });
  it("should DELETE a valid item from the cart and return the updated cart", done => {
    chai
      .request(server)
      .delete(`/v1/api/me/cart/1?accessToken=${accessToken}`)
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        checkForValidCartItemsArray(response.body);
        //from the posts above the cart currently has 2 items and 2 diff quantities on those items
        expect(response.body.length).to.equal(1);
        let cartItem2;
        cartItem2 = response.body.find(p => p.product.id === "2");
        expect(cartItem2).to.exist;
        expect(cartItem2.quantity).to.equal(1);
        done();
      });
  });
  it("should attempt to delete from the cart but forget accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .delete(`/v1/api/me/cart/1`)
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
  it("should attempt to delete from the cart but have an invalid accessToken and return a 401 Unauthorized", done => {
    chai
      .request(server)
      .delete(
        `/v1/api/me/cart/1?accessToken=definitelynotarealuidunlesswerereallylucky`
      )
      .send({})
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 401);
        expect(response.body.message).to.equal("Invalid Access Token");
        done();
      });
  });
  it("should DELETE an invalid or missing item from the cart and return a 404 not found error", done => {
    chai
      .request(server)
      .delete(`/v1/api/me/cart/XYZ?accessToken=${accessToken}`)
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidIssueResponse(response, 404);
        expect(response.body.message).to.equal("Missing Product In Cart");
        done();
      });
  });
});
