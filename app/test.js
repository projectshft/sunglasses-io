let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require ('./server');
let Products = require ('../initial-data/products');
let expect = chai.expect;

let should = chai.should();

chai.use(chaiHttp);


// let assert = require('assert');


//set a test for a get request 
describe('/GET products', () => {
    //if no query is entered all of the products should be returned 
        it('should GET all the products if no search query defined', done => {
            chai
                .request(server)
                .get('/api/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect("Content-Type", "application/json");
                    res.body.should.be.an('array'); 
                    res.body.length.should.be.eql(11);               
                    done();
                })
        })
        //if a single query is entered, the specific product should be returned
        it('should return only the products that match that specific query', done => {
            chai    
                .request(server)
                .get('/api/products?q=Brown+Sunglasses')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect("Content-Type", "application/json");
                    res.body.should.be.an('array')
                    res.body.should.have.lengthOf(1);
                    done();
                })
        })
        //if the query doesn't match any products in the store return a 400 error
        it (' should return an error if an unrecognized query is entered', done => {
            chai
                .request(server)
                .get('/api/products?q=zz')
                .end((err, res) =>  {
                    res.should.have.status(400);
                    done();
                })
        })        
});


