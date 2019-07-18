const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

const expect = chai.expect;
const assert = chai.assert;
// let should = chai.should();

chai.use(chaiHTTP);

// describe... endpoints 