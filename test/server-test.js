const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

//test GET /api/brands
describe("/GET  brands", () => {
	it("should GET all brands", done => {
		chai
			.request(server)
			.get("/api/brands")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.have.lengthOf(5);
				done();
			});
	});
});

//test GET /api/products
describe("/GET products", () => {
	it("should GET all products when no query", done => {
		chai
			.request(server)
			.get("/api/products")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.have.lengthOf(11);
				done();
			});
	});
	it("should GET all products that match user's search query", done => {
		chai	
			.request(server)
			.get("/api/products?query=Superglasses")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.have.lengthOf(1);
				done();
			});
	});
	it("should return an error if search query does not match any products", done => {
		chai
			.request(server)
			.get("/api/products?query=qwertyasdf")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(404);
				done();
			});
	});
	// it("should return an error if no products can be returned", done => {
	// 	chai
	// 		.request(server)
	// 		.get("/api/products")
	// 		.end((error, response) => {
	// 			chai.assert.exists(response.body);
	// 			chai.expect(response).to.have.status(400);
	// 			done();
	// 		});
	// });
});

// Test for GET /api/brands/:id/products
describe("GET products by brand ID", () => {
	it("should get all products based on a brand id", done => {
		chai
			.request(server)
			.get("/api/brands/2/products")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.have.lengthOf(2);
				done();
			})
	});
});