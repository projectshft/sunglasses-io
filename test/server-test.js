const chai = require("chai");
const server = require('../app/server')
const chaiHTTP = require("chai-http");

const assert = chai.assert;
const { expect } = require('chai');
const should = chai.should();

chai.use(chaiHTTP);



//Get Brands 
describe('/GET brands', () => {
    it.only('it should GET all the brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.not.be.null;
                res.body.should.be.an('array');
                res.body.length.should.be.eql(5);
                done();
            });
    });

});
//Get Products 
describe('/GET products', () => {
    it.only('should GET all the products', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(11);
                done();
            });
    });

    it.only('should GET products based on query', done => {
        chai
            .request(server)
            .get('/api/products?query=best')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(4);
                done();
            });
    });
    it.only('should GET an error message if no query is entered in search field', done => {
        chai
            .request(server)
            .get('/api/products?query=' + '')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('string');
                res.body.length.should.be.eql(21);
                done();
            });
    });

    it.only('should GET error if there are no products that match query', done => {
        chai
            .request(server)
            .get('/api/products?query=candy')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('string');
                res.body.length.should.be.eql(42);
                done();
            });
    });

    it.only('should be able to search in uppercase or lowercase letters', done => {
        chai
            .request(server)
            .get('/api/products?query=GLASSES')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(10);
                done();
            });
    });
});



