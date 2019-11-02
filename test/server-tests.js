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

describe("/GET brands", () => {
  it("should GET all brands", done => {
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
        expect(response).to.not.be.null;
        expect(response).to.have.status(404);
        expect(response.body).to.not.be.null;
        expect(response.body).to.be.an("object");
        expect(response.body).to.have.property("code");
        expect(response.body).to.have.property("message");
        expect(response.body.code).to.be.a("number");
        expect(response.body.code).to.equal(404);
        expect(response.body.message).to.exist;
        expect(response.body.message).to.not.be.empty;
        expect(response.body.message).to.be.a("string");
        done();
      });
  });
});
