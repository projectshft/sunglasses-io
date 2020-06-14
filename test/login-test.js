let User = require('../app/models/login-model');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);


describe('/POST User', () => {
  it('it should check if required user properties are present', done => {
    //arrange a scenario
    let testUser = {
      "gender": "female",
      "cart":[],
      "name": {
          "title": "mrs",
          "first": "susanna",
          "last": "richards"
      },
      "location": {
          "street": "2343 herbert road",
          "city": "duleek",
          "state": "donegal",
          "postcode": 38567
      },
      "email": "susanna.richards@example.com",
      "login": {
          "username": "yellowleopard753",
          "password": "jonjon",
          "salt": "eNuMvema",
          "md5": "a8be2a69c8c91684588f4e1a29442dd7",
          "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
          "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      },
      "dob": "1954-10-09 10:47:17",
      "registered": "2003-08-03 01:12:24",
      "phone": "031-941-6700",
      "cell": "081-032-7884",
      "picture": {
          "large": "https://randomuser.me/api/portraits/women/55.jpg",
          "medium": "https://randomuser.me/api/portraits/med/women/55.jpg",
          "thumbnail": "https://randomuser.me/api/portraits/thumb/women/55.jpg"
      },
      "nat": "IE"
  };
    //act  check for required user type (object) and required properties of user (will check login credentials in a separate way)
    chai
      .request(server)
      .post('/api/login')
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('cart');
        res.body.should.have.property('name')
        res.body.should.have.property('email', 'susanna.richards@example.com');
        res.body.should.have.property('login')
        res.body.should.have.property('registered', '2003-08-03 01:12:24');
        done();
      })
  });

  
  it('it should fail with a 401 error if username or password is incorrect', done => {
    // arrange
    let testUser2 = {
      "gender": "male",
      "cart":[],
      "name": {
          "title": "mr",
          "first": "salvador",
          "last": "jordan"
      },
      "location": {
          "street": "9849 valley view ln",
          "city": "burkburnett",
          "state": "delaware",
          "postcode": 78623
      },
      "email": "salvador.jordan@example.com",
      "login": {
          "username": "lazywolf342",
          "password": "tucker",
          "salt": "oSngghny",
          "md5": "30079fb24f447efc355585fcd4d97494",
          "sha1": "dbeb2d0155dad0de0ab9bbe21c062e260a61d741",
          "sha256": "4f9416fa89bfd251e07da3ca0aed4d077a011d6ef7d6ed75e1d439c96d75d2b2"
      },
      "dob": "1955-07-28 22:32:14",
      "registered": "2010-01-10 06:52:31",
      "phone": "(944)-261-2164",
      "cell": "(888)-556-7285",
      "picture": {
          "large": "https://randomuser.me/api/portraits/men/4.jpg",
          "medium": "https://randomuser.me/api/portraits/med/men/4.jpg",
          "thumbnail": "https://randomuser.me/api/portraits/thumb/men/4.jpg"
      },
      "nat": "US"
  }
    // act
    chai
      .request(server)
      .post('/api/login')
      .send(testUser2)
      .end((err, res) => {
        // assert
        res.should.have.status(401);
        done();
      });
  });


  it('it should fail with a 400 error if email is not provided', done => {
    // arrange
    let testUser3 =  {
      "cart":[],
      "name": {
          "title": "mrs",
          "first": "susanna",
          "last": "richards"
      },
      "location": {
          "street": "2343 herbert road",
          "city": "duleek",
          "state": "donegal",
          "postcode": 38567
      },
      "email": "",
      "login": {
          "username": "yellowleopard753",
          "password": "jonjon",
          "salt": "eNuMvema",
          "md5": "a8be2a69c8c91684588f4e1a29442dd7",
          "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
          "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      },
      "registered": "2003-08-03 01:12:24",
  };
    // act
    chai
      .request(server)
      .post('/api/login')
      .send(testUser3)
      .end((err, res) => {
        // assert
        res.should.have.status(400);
        done();
      });
  });

  it('it should fail with a 400 error if username is not provided', done => {
    // arrange
    let testUser4 =  {
      "cart":[],
      "name": {
          "title": "mrs",
          "first": "susanna",
          "last": "richards"
      },
      "location": {
          "street": "2343 herbert road",
          "city": "duleek",
          "state": "donegal",
          "postcode": 38567
      },
      "email": "susanna.richards@example.com",
      "login": {
          "username": "",
          "password": "jonjon",
          "salt": "eNuMvema",
          "md5": "a8be2a69c8c91684588f4e1a29442dd7",
          "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
          "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      },
      "registered": "2003-08-03 01:12:24",
  };
    // act
    chai
      .request(server)
      .post('/api/login')
      .send(testUser4)
      .end((err, res) => {
        // assert
        res.should.have.status(400);
        done();
      });
  });


  it('it should fail with a 400 error if password is not provided', done => {
    // arrange
    let testUser5 =  {
      "cart":[],
      "name": {
          "title": "mrs",
          "first": "susanna",
          "last": "richards"
      },
      "location": {
          "street": "2343 herbert road",
          "city": "duleek",
          "state": "donegal",
          "postcode": 38567
      },
      "email": "susanna.richards@example.com",
      "login": {
          "username": "yellowleopard753",
          "password": "",
          "salt": "eNuMvema",
          "md5": "a8be2a69c8c91684588f4e1a29442dd7",
          "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
          "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      },
      "registered": "2003-08-03 01:12:24",
  };
    // act
    chai
      .request(server)
      .post('/api/login')
      .send(testUser5)
      .end((err, res) => {
        // assert
        res.should.have.status(400);
        done();
      });
  });
});
