let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let expect = chai.expect();

chai.use(chaiHttp);

