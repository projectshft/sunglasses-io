let Book = require('../app/models/book');
​
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
​
let should = chai.should();
​
chai.use(chaiHttp);
​
describe('Books', () => {
  beforeEach(() => {
    Book.removeAll();
  });
​
  describe('/GET book', () => {
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
​
  describe('/POST book', () => {
    it('it should POST a book ', done => {
      // arrange
      let book = {
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        year: 2008,
        pages: 301
      };
      // act
      chai
        .request(server)
        .post('/book')
        .send(book)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title');
          res.body.should.have.property('author');
          res.body.should.have.property('pages');
          res.body.should.have.property('year');
          done();
        });
    });
    it('it should not POST a book without pages', done =>{
         // arrange
      let book = {
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        year: 2008
      };
      // act
      chai
        .request(server)
        .post('/book')
        .send(book)
        // assert
        .end((err, res) => {
        res.should.have.status(500);    
          done();
        });
    })
  });
  describe('/GET book/:id', () => {
    it('it should GET a book by the given id', done => {
        //arrange
        let book = {
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        year: 2008,
        pages: 301
        };
        //act
        chai
        .request(server)
        .post('/book')
        .send(book)
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          chai
          .request(server)
          .get('/book/' + res.body.id)
          .end((err, res) => {
              res.should.have.status(200);
              done();
            })
        })
    });
  });
  describe('/PUT book/:id', () => {
    it('it should UPDATE a book by the given id', done => {
        //arrange
        let book = {
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        year: 2008,
        pages: 301
        };
        //act
        chai
        .request(server)
        .post('/book')
        .send(book)
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          // Change the title to something else
          const createdBook = res.body 
          createdBook.title = "Gilligan's Island"
          chai
          .request(server)
          .put('/book/' + createdBook.id)
          .send(createdBook)
          .end((err, res) => {
              res.should.have.status(200);
              chai
              .request(server)
              .get('/book/'+ createdBook.id)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.title.should.equal("Gilligan's Island");
              done();
            })
        })
    });
  });
});
describe('/DELETE book/:id', () => {
  it('it should DELETE a book by given id', done => {
    // arrange
    let book = {
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      year: 2008,
      pages: 301
      };
      //act
      chai
      .request(server)
      .post('/book')
      .send(book)
      //assert
      .end((err, res) => {
        res.should.have.status(200);
        chai
        .request(server)
        .get('/book/' + res.body.id)
        .end((err, res) => {
          res.should.have.status(200);
          chai
          .request(server)
          .delete('/book/' + res.body.id)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          })
        })
      })
    });
  });
});