const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;

const EXPECTED_LENGTH_OF_BRANDS = 5;
const EXPECTED_LENGTH_OF_PRODUCTS = 11;
const EXPECTED_LENGTH_OF_FILTERED_PRODUCTS = 3;
const EXPECTED_AVAILABLE_ID_NUM = "1";
const BAD_BRAND_ID = "00000000000000000000000000000";

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

let checkForValidArrayBodyResponse = response => {
  expect(response.body).to.not.be.null;
  expect(response).to.have.status(200);
  expect(response).to.have.header("Content-Type", "application/json");
  expect(response.body).to.be.an("array");
};

let checkForValidBrandsArray = brands => {
  let usedIds = [];
  brands.forEach(item => {
    expect(item).to.be.an("object");
    expect(item).to.have.property("id");
    expect(item).to.have.property("name");
    //id existence check
    expect(item["id"]).to.exist;
    expect(item["id"]).to.not.be.empty;
    expect(item["id"]).to.be.a("string");
    //check for unique keys
    let exists = usedIds.includes(item["id"]);
    expect(exists).to.be.false;
    usedIds.push(item["id"]);
    expect(item["name"]).to.be.a("string");
  });
};

let checkForValidProductsArray = products => {
  let usedIds = [];
  products.forEach(item => {
    expect(item).to.be.an("object");
    //property check
    expect(item).to.have.property("id");
    expect(item).to.have.property("categoryId");
    expect(item).to.have.property("name");
    expect(item).to.have.property("description");
    expect(item).to.have.property("price");
    expect(item).to.have.property("imageUrls");
    //make sure imageUrls is array of strings
    item["imageUrls"].forEach(image => {
      expect(image).to.exist;
      expect(image).to.not.be.empty;
      expect(image).to.be.a("string");
    });
    //type checking
    expect(item["id"]).to.be.a("string");
    expect(item["categoryId"]).to.be.a("string");
    expect(item["name"]).to.be.a("string");
    expect(item["description"]).to.be.a("string");
    expect(item["price"]).to.be.a("number");
    expect(item["imageUrls"]).to.be.a("array");
    //id existence check
    expect(item["id"]).to.exist;
    expect(item["id"]).to.not.be.empty;
    //category is required for other end points?
    expect(item["categoryId"]).to.exist;
    expect(item["categoryId"]).to.not.be.empty;
    expect(item["categoryId"]).to.be.a("string");
    //check for unique keys
    let exists = usedIds.includes(item["id"]);
    expect(exists).to.be.false;
    usedIds.push(item["id"]);
    expect(item["name"]).to.be.a("string");
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
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_BRANDS);
        checkForValidBrandsArray(response.body);
        done();
      });
  });
});

describe("/GET products", () => {
  it("should GET all products", done => {
    chai
      .request(server)
      .get("/v1/products")
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(EXPECTED_LENGTH_OF_PRODUCTS);
        checkForValidProductsArray(response.body);
        done();
      });
  });
});

describe("/GET brands/:brandId/products", () => {
  it("should GET all products that match a valid specified brand id", done => {
    chai
      .request(server)
      .get(`/v1/brands/${EXPECTED_AVAILABLE_ID_NUM}/products`)
      .end((error, response) => {
        expect(error).to.be.null;
        checkForValidArrayBodyResponse(response);
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body.length).to.be.lte(EXPECTED_LENGTH_OF_PRODUCTS);
        expect(response.body.length).to.be.equal(
          EXPECTED_LENGTH_OF_FILTERED_PRODUCTS
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
