const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses.io API', () => {
  describe('GET /brands', () => {
    it('it should get a 200 response', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    
    it('it should get all brands in sunglasses store', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('it should search for and find brand "Oakley"', done => {
      chai
        .request(server)
        .get('/brands?query=Oakley')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Oakley');

          done();
        });
    });

    it('it should search for and find brand "oakley" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=oakley')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Oakley');

          done();
        });
    });

    it('it should search for and find brand "Ray Ban"', done => {
      chai
        .request(server)
        .get('/brands?query=Ray Ban')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Ray Ban');

          done();
        });
    });

    it('it should search for and find brand "ray ban" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=ray ban')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Ray Ban');

          done();
        });
    });

    it('it should search for and find brand "Levi\'s"', done => {
      chai
        .request(server)
        .get('/brands?query=Levi\'s')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Levi\'s');

          done();
        });
    });
    
    it('it should search for and find brand "levi\'s" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=levi\'s')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Levi\'s');

          done();
        });
    });

    it('it should search for and find brand "DKNY"', done => {
      chai
        .request(server)
        .get('/brands?query=DKNY')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('DKNY');

          done();
        });
    });

    it('it should search for and find brand "dkny" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=dkny')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('DKNY');

          done();
        });
    });

    it('it should search for and find brand "Burberry"', done => {
      chai
        .request(server)
        .get('/brands?query=Burberry')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Burberry');

          done();
        });
    });

    it('it should search for and find brand "burberry" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=burberry')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body.should.have.property('id');
          res.body.should.have.property('name');

          res.body.id.should.equal('1');
          res.body.name.should.equal('Burberry');

          done();
        });
    });

    it('it should search for "ball" and return 404 not found error', done => {
      chai
        .request(server)
        .get('/brands?query=ball')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.code.should.equal(404);
          res.body.message.should.equal('Brand not found');
          res.body.fields.should.equal('query');
          done();
        });
    });
  });
});