const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
let token = null;

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
	it("should return 404 error if search query does not match any products", done => {
		chai
			.request(server)
			.get("/api/products?query=qwertyasdf")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(404);
				done();
			});
	});
	// it("should return 400 error if no products can be returned", done => {
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

// Test GET /api/brands/:id/products
describe("/GET products by brand ID", () => {
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
	it("should return 404 error if no brand id matches query", done => {
		chai
			.request(server)
			.get("/api/brands/10/products")
			.end((error, response) => {
				chai.assert.exists(response.body);
				chai.expect(response).to.have.status(404);
				done();
			})
	});
});

// Test POST /api/login
describe("/POST login user", () => {
	it("should login a user", done => {
		chai
			.request(server)
			.post("/api/login")
			.send({username: 'yellowleopard753', password: 'jonjon'})
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.lengthOf(16);
				chai.expect(response.body).to.be.a("string");
				token = response.body;
				done();
			})
	})
	it("should return 401 error when username or password are incorrect", done => {
		chai
			.request(server)
			.post("/api/login")
			.send({username: 'invalidUser', password: 'invalidPassword'})
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(401);
				done();
			})
	})
	it("should return 400 error if formatting of credentials are incorrect", done => {
		chai
			.request(server)
			.post("/api/login")
			.send({username: '', password: ''})
			.end((error,response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(400);
				done();
			})
	})
});

// Test POST /api/me/cart/:productId
describe("/POST add a product to cart" , () => {
	it("should add a product to the user's cart", done => {
		chai
			.request(server)
			.post("/api/me/cart/1")
			.set("token", token)
			.end((error, response) => {
				chai.assert.isNull(error);
        		chai.expect(response).to.have.status(200);
        		chai.expect("Content-Type", "application/json");        
        		chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.be.lengthOf(1);
				chai.expect(response.body).to.deep.equal([
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
			})
	});
	it("should update item quantity if product exists in cart already", done => {
		chai
			.request(server)
			.post("/api/me/cart/1")
			.set("token", token)
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.be.lengthOf(1);
				chai.expect(response.body[0].quantity).to.eql(2)
				chai.expect(response.body).to.deep.equal([
					{
						"id": "1",
        				"categoryId": "1",
       					"name": "Superglasses",
       					"description": "The best glasses in the world",
       					"price":150,
       					"imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
						"quantity": 2
					}
				]);
				done();
			})
	})
	it("should return 400 error if productId is invalid", done => {
		chai
		  .request(server)
		  .post("/api/me/cart/13")
		  .set("token", token)
		  .end((error, response) => {
			chai.assert.isNull(error);
			chai.expect(response).to.have.status(400);
			chai.expect("Content-Type", "application/json");
			done();
		  });
	  });
	it("should return 404 error if token is bad", done => {
		chai
		  .request(server)
		  .post("/api/me/cart/3")
		  .set("token", "badToken")
		  .end((error, response) => {
			chai.assert.isNull(error);
			chai.expect(response).to.have.status(404);
			done();
		  });
	  });
});

// Test GET /api/me/cart
describe("/GET the user's cart", () => {
	it("should get all items that are in the user's cart", done => {
		chai
			.request(server)
			.get("/api/me/cart")
			.set("token", token)
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.be.lengthOf(1);
				chai.expect(response.body).to.deep.equal([
					{
						"id": "1",
        				"categoryId": "1",
       					"name": "Superglasses",
       					"description": "The best glasses in the world",
       					"price":150,
       					"imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
						"quantity": 2
					}
				])
				done();
			});
	});
	it("should return 404 error if token is bad", done => {
		chai
		  .request(server)
		  .post("/api/me/cart")
		  .set("token", "badToken")
		  .end((error, response) => {
			chai.assert.isNull(error);
			chai.expect(response).to.have.status(404);
			done();
		  });
	});
});

// Test PUT /api/me/cart
describe("/PUT item quantities to user's cart", () => {
	it("should update item quantitites in the user's cart", done => {
		chai
			.request(server)
			.put("/api/me/cart")
			.set("token", token)
			.send({updatedQuantities: [100]})
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(200);
				chai.expect("Content-Type", "application/json");
				chai.expect(response.body).to.be.an("array");
				chai.expect(response.body).to.be.lengthOf(1);
				chai.expect(response.body[0].quantity).to.eql(100);
				chai.expect(response.body).to.deep.equal([
					{
						"id": "1",
            			"categoryId": "1",
            			"name": "Superglasses",
            			"description": "The best glasses in the world",
            			"price":150,
            			"imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
            			"quantity": 100
					}
				]);
				done();
			});
	});
	it("should return error 404 if token is bad", done => {
		chai
			.request(server)
			.put("/api/me/cart")
			.set("token", "badToken")
			.end((error, response) => {
				chai.assert.isNull(error);
				chai.expect(response).to.have.status(404);
				done();
			});
	});
});