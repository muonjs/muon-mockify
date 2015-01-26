require("coffee-script/register");

require("chai").should();
global.expect = require("chai").expect;
global.mockify = require("muon-mockify");
global.sinon = require("sinon");