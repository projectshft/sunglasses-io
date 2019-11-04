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

    it.only('should GET products based on query search', done => {
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

    it.only('should GET error if there are no products that match the query', done => {
        chai
            .request(server)
            .get('/api/products?query=gucci')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('string');
                res.body.length.should.be.eql(42);
                done();
            });
    });

    it.only('fails as expected when unrecognized property', done => {
        chai
            .request(server)
            .get('/api/products?query=sdfv')
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

// Get Products by brand 
describe('/GET products by brand id ', () => {
    it.only('should GET all products for a particular brand', done => {
        chai
            .request(server)
            .get('/api/brands/1/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(3);
                done();
            });
    });

    it.only('it should give an error if it is given an id for which there is no brand', done => {
        chai
            .request(server)
            .get('/api/brands/9/products')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.an('string');
                res.body.length.should.be.eql(25);
                done();
            });
    });


});

// Post Login 
describe('/Post Login ', () => {
    it.only('should take in the users credentials to verify who they are ', done => {

        let user = {
            username: 'yellowleopard753',
            password: 'jonjon'
        };

        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('string');
                done();
            });
    });

    it.only('should return an error if there is nothing in username or password fields ', done => {

        let user = {
            username: '',
            password: ''
        };

        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('string');
                done();
            });

    });

    it.only('should return error if password is wrong', done => {

        let user = {
            username: 'yellowleopard753',
            password: 'jonjon456'
        };

        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('string');
                done();
            });
    });

    it.only('should return error if username is wrong', done => {

        let user = {
            username: 'yellowleopard999',
            password: 'jonjon'
        };

        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('string');
                done();
            });
    });


});

//Add to cart Post
describe('/Post add to cart button ', () => {
    it.only('should check to make sure user has access token ', done => {
        let accessToken = [{
            token: '87987'
        }];
        chai
            .request(server)
            .post('/api/me/cart')
            .send(accessToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it.only('if the access token does not match assigned token ', done => {
        let accessToken = [{
            token: '879d7'
        }];
        chai
            .request(server)
            .post('/api/me/cart')
            .send(accessToken)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('array');
                done();
            });
    });
});