let server = require('./app/server')

let { expect } = require('chai');



describe('Books', () => {
    beforeEach(done => {
        Book.removeAll();
    });

    describe('/GET brands', () => {
        it('it should GET all the books', done => {
            chai
                .request(server)
                .get('/book')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

