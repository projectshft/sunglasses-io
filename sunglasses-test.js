/* eslint-disable no-undef */
let { expect } = require('chai');
 
describe('The data for brands', () => {
	it('should be an array', () => {
		let brands = require('./initial-data/brands.json');
		expect(brands).to.be.an('array');
	});
	it('should contain at least 1 brand', () => {
		let brands = require('./initial-data/brands.json');
		expect(brands.length).to.be.at.least(1);
	});
	it('should contain objects with the correct properties', () => {
		let brands = require('./initial-data/brands.json');
		brands.forEach(brand => {
			expect(brand).to.be.an('object');
			expect(brand).to.have.property('id');
			expect(brand).to.have.property('name');
		});
	});
});


