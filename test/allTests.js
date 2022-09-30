/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let chai = require('chai');
let { expect } = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);
let accessToken = require('../app/server');

describe('The data for brands', () => {
	it('should be an array', () => {
		let brands = require('../initial-data/brands.json');
		expect(brands).to.be.an('array');
	});
	it('should have a length of 5', () => {
		let brands = require('../initial-data/brands.json');
		expect(brands.length).to.eql(5);
	});
	it('should contain objects with all the appropriate properties', () => {
		let brands = require('../initial-data/brands.json');
		brands.forEach((brand) => {
			expect(brand).to.be.an('object');
			expect(brand).to.have.property('id');
			expect(brand).to.have.property('name');
		});
	});
	it('should have properties with the appropriate data-types', () => {
		let brands = require('../initial-data/brands.json');
		brands.forEach((brand) => {
			expect(brand.id).to.be.a('string');
			expect(brand.name).to.be.a('string');
		});
	});
	it('should contain objects with unique ids', () => {
		let brands = require('../initial-data/brands.json');
		let ids = brands.map((brand) => brand.id);
		expect(ids).to.have.lengthOf(new Set(ids).size);
	});
	it('should contain objects with unique names', () => {
		let brands = require('../initial-data/brands.json');
		let names = brands.map((brand) => brand.name);
		expect(names).to.have.lengthOf(new Set(names).size);
	});
});

describe('The data for products', () => {
	it('should be an array', () => {
		let products = require('../initial-data/products.json');
		expect(products).to.be.an('array');
	});
	it('should contain at least 1 product', () => {
		let products = require('../initial-data/products.json');
		expect(products.length).to.be.at.least(1);
	});
	it('should have a length of 11', () => {
		let products = require('../initial-data/products.json');
		expect(products.length).to.be.equal(11);
	});
	it('should contain objects with all the appropriate properties', () => {
		let products = require('../initial-data/products.json');
		products.forEach((product) => {
			expect(product).to.be.an('object');
			expect(product).to.have.property('id');
			expect(product).to.have.property('categoryId');
			expect(product).to.have.property('name');
			expect(product).to.have.property('description');
			expect(product).to.have.property('price');
			expect(product).to.have.property('imageUrls');
		});
	});
	it('should have properties with the appropriate data-types', () => {
		let products = require('../initial-data/products.json');
		products.forEach((product) => {
			expect(product.id).to.be.a('string');
			expect(product.categoryId).to.be.a('string');
			expect(product.name).to.be.a('string');
			expect(product.description).to.be.a('string');
			expect(product.price).to.be.a('number');
			expect(product.imageUrls).to.be.an('array');
		});
	});
	it('should contain objects with unique ids', () => {
		let products = require('../initial-data/products.json');
		let ids = products.map((product) => product.id);
		expect(ids).to.have.lengthOf(new Set(ids).size);
	});
	it('should contain objects with unique names', () => {
		let products = require('../initial-data/products.json');
		let names = products.map((product) => product.name);
		expect(names).to.have.lengthOf(new Set(names).size);
	});
});

describe('The data for users', () => {
	it('should be an array', () => {
		let users = require('../initial-data/users.json');
		expect(users).to.be.an('array');
	});
	it('should contain at least 1 user', () => {
		let users = require('../initial-data/users.json');
		expect(users.length).to.be.at.least(1);
	});
	it('should have a length of 3', () => {
		let users = require('../initial-data/users.json');
		expect(users.length).to.be.equal(3);
	});
	it('should contain objects with all the appropriate properties', () => {
		let users = require('../initial-data/users.json');
		users.forEach((user) => {
			expect(user).to.be.an('object');
			expect(user).to.have.property('gender');
			expect(user).to.have.property('cart');
			expect(user).to.have.property('name');
			expect(user).to.have.property('location');
			expect(user).to.have.property('email');
			expect(user).to.have.property('login');
			expect(user).to.have.property('dob');
			expect(user).to.have.property('registered');
			expect(user).to.have.property('phone');
			expect(user).to.have.property('cell');
			expect(user).to.have.property('picture');
			expect(user).to.have.property('nat');
		});
	});
	it('should have properties with the appropriate data-types', () => {
		let users = require('../initial-data/users.json');
		users.forEach((user) => {
			expect(user.gender).to.be.a('string');
			expect(user.cart).to.be.an('array');
			expect(user.name).to.be.an('object');
			expect(user.name.title).to.be.a('string');
			expect(user.name.first).to.be.a('string');
			expect(user.name.last).to.be.a('string');
			expect(user.location).to.be.an('object');
			expect(user.location.street).to.be.a('string');
			expect(user.location.city).to.be.a('string');
			expect(user.location.state).to.be.a('string');
			expect(user.location.postcode).to.be.a('number');
			expect(user.email).to.be.a('string');
			expect(user.login).to.be.an('object');
			expect(user.login.username).to.be.a('string');
			expect(user.dob).to.be.an('string');
			expect(user.registered).to.be.an('string');
			expect(user.phone).to.be.a('string');
			expect(user.cell).to.be.a('string');
			expect(user.picture).to.be.an('object');
			expect(user.picture.large).to.be.a('string');
			expect(user.picture.medium).to.be.a('string');
			expect(user.picture.thumbnail).to.be.a('string');
			expect(user.nat).to.be.a('string');
		});
	});
	it('should contain objects with unique emails', () => {
		let users = require('../initial-data/users.json');
		let emails = users.map((user) => user.email);
		expect(emails).to.have.lengthOf(new Set(emails).size);
	});
});

describe('/GET brands', () => {
	it('should GET all brands', (done) => {
		chai
			.request(server)
			.get('/api/brands')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('array');
				res.body.length.should.be.eql(5);
				res.body[0].should.have.property('id');
				res.body[0].should.have.property('name');
				res.body[0].id.should.be.a('string');
				res.body[0].name.should.be.a('string');
				done();
			});
	});
});

describe('/GET products', () => {
	it('should return all products', (done) => {
		chai
			.request(server)
			.get('/api/products')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('array');
				res.body[0].should.have.property('id');
				res.body[0].should.have.property('categoryId');
				res.body[0].should.have.property('name');
				res.body[0].should.have.property('description');
				res.body[0].should.have.property('price');
				res.body[0].should.have.property('imageUrls');
				res.body[0].id.should.be.a('string');
				res.body[0].categoryId.should.be.a('string');
				res.body[0].name.should.be.a('string');
				res.body[0].description.should.be.a('string');
				res.body[0].price.should.be.a('number');
				res.body[0].imageUrls.should.be.an('array');
				done();
			});
	});
});

describe('/GET users', () => {
	it('should return all users', (done) => {
		chai
			.request(server)
			.get('/api/users')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('array');
				res.body.length.should.be.eql(3);
				res.body[0].should.have.property('gender');
				res.body[0].should.have.property('cart');
				res.body[0].should.have.property('name');
				res.body[0].should.have.property('location');
				res.body[0].should.have.property('email');
				res.body[0].should.have.property('login');
				res.body[0].should.have.property('dob');
				res.body[0].should.have.property('registered');
				res.body[0].should.have.property('phone');
				res.body[0].should.have.property('cell');
				res.body[0].should.have.property('picture');
				res.body[0].should.have.property('nat');
				done();
			});
	});
});

describe('/GET products by brand', () => {
	it('should return all products for a specific brand', done => {
		let categoryId = '2';
		
		chai
			.request(server)
			.get(`/api/brands/${categoryId}/products`)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('array');
				res.body[0][0].should.have.property('id');
				res.body[0][0].should.have.property('categoryId');
				res.body[0][0].should.have.property('name');
				res.body[0][0].should.have.property('description');
				res.body[0][0].should.have.property('price');
				res.body[0][0].should.have.property('imageUrls');
				res.body[0][0].id.should.be.a('string');
				res.body[0][0].categoryId.should.be.a('string');
				res.body[0][0].name.should.be.a('string');
				res.body[0][0].description.should.be.a('string');
				res.body[0][0].price.should.be.a('number');
				res.body[0][0].imageUrls.should.be.an('array');
				done();
			});
	});
});

describe('/POST user login', () => {
	it('should return a token', done => {
		let user = {
			username: 'yellowleopard753',
			password: 'jonjon'
		};
		chai
			.request(server)
			.post('/api/login')
			.send(user)
			.end((err, res) => {
				// console.log(res.body);
				res.should.have.status(200);
				// res.body.should.be.an('object');
				// res.body.should.have.property('token');
				// res.body.token.should.be.a('string');
				// res.body.token.should.have.lengthOf(16);
				done();
			});
	});
});




