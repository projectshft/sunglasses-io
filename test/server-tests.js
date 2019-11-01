const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

describe("/GET brands", () => {
  it("should GET all brands", done => {
    chai
      .request(server)
      .get("/v1/brands")
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(5);
        let usedIds = [];
        response.body.forEach(item => {
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
        expect(response.body).to.not.be.null;
        expect(response).to.have.status(200);
        expect(response).to.have.header("Content-Type", "application/json");
        expect(response.body).to.be.an("array");
        //the below test would be removed when you
        //decide to implement this with a variable database.
        //adding this just for completeness
        expect(response.body).to.have.lengthOf(11);

        let usedIds = [];
        response.body.forEach(item => {
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
        done();
      });
  });
});
