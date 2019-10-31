let Server = require("../app/server");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

chai.use(chaiHttp);

