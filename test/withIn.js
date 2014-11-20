var esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    assert = require('chai').assert,
    sinon = require('sinon');

describe("withIn", function() {
  var code = "var test = 'test';",
      ast = esprima.parse(code);

  beforeEach(function() {
    sinon.spy(esprima, 'parse');
  });
  
  afterEach(function() {
    esprima.parse.restore();
  });

  it ('parses passed string', function() {
    var traversed = false;
    
    withIn(
      function(node, parent) {
        return true;
      },
      function(node, parent) {
        traversed = true;
      }
    )(code);
    
    assert(traversed);
    assert(esprima.parse.called);
  });

  it ('parses passed string with options', function() {
    var traversed = false;
    var options = {loc: true};
    
    withIn(
      function(node, parent) {
        return true;
      },
      function(node, parent) {
        traversed = true;
      }
    )(code, options);
    
    assert(traversed);
    assert(esprima.parse.withArgs(code, options).calledOnce);
  });

  it ('does not parse passed AST', function() {
    var traversed = false;
    
    withIn(
      function(node, parent) {
        return true;
      },
      function(node, parent) {
        traversed = true;
      }
    )(ast);
    
    assert(traversed);
    assert(!esprima.parse.called);
  });

  it ('does not call callback when predicate returns false', function() {
    var traversed = false;
    
    withIn(
      function(node, parent) {
        return false;
      },
      function(node, parent) {
        traversed = true;
      }
    )("var test = 'test';");
    
    assert(!traversed);
  });

  it ('has aliases has, having, & withArg', function() {
    assert(withIn === esprimatch.has);
    assert(withIn === esprimatch.having);
    assert(withIn === esprimatch.withArg);
  });

});
