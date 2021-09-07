const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("./app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
// chai.use(require("chai-sorted"));

//GET BRANDS
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});


//GET PRODUCTS OF BRAND
// describe("/GET products of brand", () => {
//   it.only("should GET all products for a brand", done => {
//     chai
//       .request(server)
//       .get("/api/1/brands")
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         expect(res.body).to.be.an("array");
//         expect(res.body[0]).to.have.keys(
//           "id",
//           "categoryId",
//           "name",
//           "description",
//           "price",
//           "imageUrls"
//         );
//         expect(res.body).to.have.lengthOf(3);
//         done();
//       });
//   });
//   it("should return 404 if brand not found", done => {
//     chai
//       .request(server)
//       .get("/api/brands/7")
//       .end((err, res) => {
//         expect(res).to.have.status(404);
//         done();
//       });
//   });
// });

//GET PRODUCTS BY QUERY
describe("/GET products based on query", () => {
  it("should GET all products related to the query", done => {
    chai
      .request(server)
      .get("/api/products?q=normal")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body[0]).to.have.keys(
          "id",
          "categoryId",
          "name",
          "description",
          "price",
          "imageUrls"
        );
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only("should return all products if query is missing", done => {
    chai
    .request(server)
    .get("/api/products?query=")
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(11);
      done();
    });
  });
  it("fails when query item not found", done => {
    chai
      .request(server)
      .get("/api/products?q=sdfv")
      .end((err, res) => {
        expect(err).to.not.be.null;
        expect(res).to.have.status(404);
        done();
      });
    });
});

//POST LOGIN USER
// describe("/POST Successful login", () => {
//   let login = {username: 'yellowleopard753', password: 'jonjon'}
//   it.only("should POST login ", done => {
//     chai
//       .request(server)
//       .post("/api/login")
//       .send(login)
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         done();
//       });
//   });
// });

//GET USER CART
// describe("/GET cart", () => {
//   let login = {username: 'yellowleopard753', password: 'jonjon'}
//   it.only("should GET users cart", done => {
//     chai
//       .request(server)
//       .post("/api/me/cart")
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         expect(res.body).to.be.an("array");
//         done();
//       });
//   });
// });

//POST SUBMIT CART
// describe("/POST items in cart for purchase", () => {
//   it.only("should POST items in cart", done => {
//     chai
//       .request(server)
//       .post("/api/me/cart")
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         done();
//       });
//   });
// });

//POST ADD ITEM TO CART
// describe("/POST add item to cart", () => {
//   it.only("should POST item to cart", done => {
//     chai
//       .request(server)
//       .post("/api/me/cart/1")
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         done();
//       });
//   });
// });

//DELETE ITEM FROM CART
// describe("/DELETE item from cart", () => {
//   it.only("should DELETE item from cart", done => {
//     chai
//       .request(server)
//       .post("/api/me/cart/1")
//       .end((err, res) => {
//         assert.isNotNull(res.body);
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         expect("Content-Type", "application/json");
//         done();
//       });
//   });
// });

