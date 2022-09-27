/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let chai = require('chai');
let { expect } = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);

describe('The data for brands', () => {
	it('should be an array', () => {
		let brands = require('../initial-data/brands.json');
		expect(brands).to.be.an('array');
	});
	it('should contain at least 1 brand', () => {
		let brands = require('../initial-data/brands.json');
		expect(brands.length).to.be.at.least(1);
	});
	it('should have a length of 5', () => {
		let brands = require('../initial-data/brands.json');
		expect(brands.length).to.be.equal(5);
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




describe('/GET brands', () => {
	it('should return all brands', (done) => {
		chai
			.request(server)
			.get('/api/brands')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('array');
				res.body.length.should.be.eql(5);
				res.body.should.have.property('id');
				res.body.should.have.property('name');
				res.body.id.should.be.a('string');
				res.body.name.should.be.a('string');
				done();
			});
	});
});




