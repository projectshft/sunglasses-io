let User = require('../app/modules/login-module');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
chai.use(require('chai-things'));
let should = chai.should();

chai.use(chaiHttp);


describe('/POST User', () => {
  it('it should login the user and return back a token', done => {
    //act  
    //send a user that already exists in the "db"
    let user = {
      username: "yellowleopard753",
      password: "jonjon"
    }
    chai
      .request(server)
      .post('/api/login')
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string');
        done();
      })
  });

  
  it('it should fail with a 401 error if username is incorrect', done => {
    // arrange
    let user = {
      username: "yellowleopard",
      password: "jonjon"
    }
    // act
    chai
      .request(server)
      .post('/api/login')
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send(user)
      .end((err, res) => {
        // assert
        res.should.have.status(401);
        done();
      });
  });

  it('it should fail with a 401 error if password is incorrect', done => {
    // arrange
    let user = {
      username: "yellowleopard753",
      password: "jon"
    }
    // act
    chai
      .request(server)
      .post('/api/login')
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send(user)
      .end((err, res) => {
        // assert
        res.should.have.status(401);
        done();
      });
  });

  it('it should fail with a 400 error if the username and password are not sent or improperly formatted', done => {
    // arrange
    let user = {
      password: "jonjon"
    }
    // act
    chai
      .request(server)
      .post('/api/login')
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send(user)
      .end((err, res) => {
        // assert
        res.should.have.status(400);
        done();
      });
  });

  it('it should fail with a 400 error if the username and password are not sent or improperly formatted', done => {
    // arrange
    let user = {
      username: "yellowleopard753"
    }
    // act
    chai
      .request(server)
      .post('/api/login')
      .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
      .send(user)
      .end((err, res) => {
        // assert
        res.should.have.status(400);
        done();
      });
  });




//   it('it should fail with a 400 error if password is not provided', done => {
//     // arrange
//     let testUser5 =  {
//       "cart":[],
//       "name": {
//           "title": "mrs",
//           "first": "susanna",
//           "last": "richards"
//       },
//       "location": {
//           "street": "2343 herbert road",
//           "city": "duleek",
//           "state": "donegal",
//           "postcode": 38567
//       },
//       "email": "susanna.richards@example.com",
//       "login": {
//           "username": "yellowleopard753",
//           "password": "",
//           "salt": "eNuMvema",
//           "md5": "a8be2a69c8c91684588f4e1a29442dd7",
//           "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
//           "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
//       },
//       "registered": "2003-08-03 01:12:24",
//   };
//     // act
//     chai
//       .request(server)
//       .post('/api/login')
//       .send(testUser5)
//       .end((err, res) => {
//         // assert
//         res.should.have.status(400);
//         done();
//       });
//   });
 });
