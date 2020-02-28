let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');


let should = chai.should();

chai.use(chaiHttp);

//testing to see that all the initial 5 brands are returned when ran
describe('/GET brands', () => {
    it('it should GET all the brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(5);
                done();
            });
    });
});
describe('/GET brands/:id/products', () => {
    it('it should GET all the products with ', done => {
        //act
        chai
            .request(server)
            .get('/api/brands/1/products')
            //assert
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(3);
                //maybe add more specifics
                done();
            });
    });
    it('it should not GET all the products with an invalid ID', done => {
        chai
            .request(server)
            .get('/api/brands/6/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
    it('it should not GET all the products if ID is not a number', done => {
        chai
            .request(server)
            .get('/api/brands/hello/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});

describe('/POST login', () => {
    it('it should POST users login', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('string')
                done();
            });
    });

    it('it should return error if users password is incorrect', done => {
        const user = {
            username: "hello",
            password: "waters"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
    it('it should return error if username is invalid', done => {
        const user = {
            username: "greenlion235",
            password: "hello"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
    it('if user did not pass any username or password', done => {
        chai
            .request(server)
            .post('/api/login')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
    it('if user already has a login token, it should return the current token', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('string')
                const token = res.body
                chai
                .request(server)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('string')
                res.should.equal(token);
              done();
            })

        });
    });
});

