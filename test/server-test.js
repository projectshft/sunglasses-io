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
			})
	});
});