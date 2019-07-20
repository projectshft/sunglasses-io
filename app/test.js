let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require ('./server');
let Products = require ('../initial-data/products');
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);


// let assert = require('assert');


//set a test for /products get request 
describe('GET /products', () => {
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
        it ('should return an error if an unrecognized query is entered', done => {
            chai
                .request(server)
                .get('/api/products?q=zz')
                .end((err, res) =>  {
                    res.should.have.status(400);
                    done();
                })
        })        
});

//set test for /brands get request
describe ('GET /brands', () => {
        it ('should GET all the brands in the database', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect("Content-Type", "application/json");
                    res.body.should.be.an('array')
                    res.body.should.have.lengthOf(5);
                    done();
                    
                }) 
    })
})

//set test for user login, /me post request
describe ('POST /login', () => {
    it ('should grant access to user if the username and password is valid', done => {
        chai
            .request(server)
            .post('/api/login')
            .send({"username": "greenlion235","password": "waters",})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.username.should.equal('greenlion235');
                res.body.password.should.equal('greenlion235');
                done();
                
            })
    })
})
