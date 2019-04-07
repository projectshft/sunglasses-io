const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

//Brands test
describe("/GET brands", () =>{
    it("should go get all of the brands", done =>{
        chai
        .request(server)
        .get("/api/brands")
        .end((error, response)=>{
            assert.isNotNull(response.body);
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(response.body).to.be.an("array");
            expect(response.body).to.have.lengthOf(5);
            done();
        });
    });
});

// Products test
describe("/GET products", () => {
    it("should go get all of the products", done => {
      chai
      .request(server)
      .get("/api/products")
      .end((error, response) => {
          assert.isNotNull(response.body);
          expect(response).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(response.body).to.be.an("array");
          done();
        });
    });
  });

// Get specific products test  
describe("/GET specific product", () => {
    it.only("should go get one product at a time", done => {
      chai
        .request(server)
        .get("/api/products/1")
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(response.body).to.have.keys([
            "id",
            "categoryId",
            "name",
            "description",
            "price",
            "imageUrls"
          ]);
        expect(response.body)
          .to.have.property("id")
          .that.is.a("string");
        expect(response.body)
          .to.have.property("categoryId")
          .that.is.a("string");
        expect(response.body)
          .to.have.property("name")
          .that.is.a("string");
        expect(response.body)
          .to.have.property("description")
          .that.is.a("string");
        expect(response.body)
          .to.have.property("price")
          .that.is.a("number");
        expect(response.body)
          .to.have.property("imageUrls")
          .that.is.an("array")
          .with.lengthOf(3);
        done();
      });
  });
});     

// specific brand test
describe("/GET specific category of product", () => {
    it.only("should go get one specific product category", done => {
      chai
        .request(server)
        .get("/api/brands/:id/products")
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(response.body).to.be.an("array");
          done();
        });
    });
  });